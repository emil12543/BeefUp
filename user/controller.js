const Boom = require('boom');
const async = require('async');
const User = require('mongoose').model('User');
const auth = require('../config/auth');
const redis = require('../config/redis');

exports.getAll = (request, reply) => {
    User.find({}, (err, users) => {
        if (err)
            return reply(Boom.badImplementation(err));

        return reply(users);
    });
};

exports.getOne = (request, reply) => {
    User.findById(request.params.id, (err, user) => {
        if (err)
            return reply(Boom.badImplementation(err));

        return reply(user);
    });
};

exports.remove = (request, reply) => {
    User.findByIdAndRemove(request.params.id, err => {
        if (err)
            return reply(Boom.badImplementation(err));

        return reply({
            message: "User deleted successfully"
        });
    });
};

exports.create = (request, reply) => {
    User.create(request.payload, (err, user) => {
        if (err)
            return reply(Boom.badImplementation(err));

        return reply({
            _id: user.id,
            name: user.name
        });
    });
};

exports.getToken = (request, reply) => {
    async.waterfall([
        callback => {
            User.findOne({
                username: request.payload.username
            }, (err, user) => {
                if (err)
                    return callback(err);

                if (!user)
                    return reply(Boom.badRequest('Wrong username or password'));

                user.verifyPassword(request.payload.password, (err, isMatch) => {
                    if (err)
                        return callback(err);

                    if (!isMatch)
                        return reply(Boom.badRequest('Wrong username or password'));

                    return callback(null, {
                        _id: user._id,
                        role: user.role
                    });
                });
            });
        },
        (user, callback) => {
            auth.sign(user, (err, token) => {
                if (err)
                    return callback(err);

                redis.addItem(token, user._id);
                return callback(null, user, token);
            });
        },
        (user, token, callback) => {
            User.findByIdAndUpdate(
                user._id,
                { $push : {
                    'tokens': {
                        token,
                        device: request.headers['user-agent'],
                        address: request.info.remoteAddress
                    }
                }},
                { safe: true, upsert: true },
                (err, user) => {
                    if (err)
                        return callback(err);

                    return reply({ token: token })
                }
            )
        }
    ], err => {
        if (err)
            return reply(Boom.badImplementation(err));
    });
};

exports.revokeToken = (request, reply) => {
    async.waterfall([
        callback => {
            auth.verify(request.payload.token, (err, decoded) => {
                if (err)
                    return reply(Boom.badRequest('Invalid token'));

                if (request.payload.token === request.headers.authorization)
                    return reply(Boom.badData('The token and the Authorization token are the same'));

                if (decoded._id === request.auth.credentials._id) {
                    redis.deleteItem(request.payload.token);
                    // TODO: check if the delete action is done correctly
                    callback(null, decoded, request.payload.token);
                } else
                    return reply(Boom.unauthorized('You are not authorized to revoke this token'));
            });
        },
        (decoded, token, callback) => {
            User.findOneAndUpdate(
                {
                    _id: decoded._id,
                    'tokens.token': token
                },
                { $set: {
                    'tokens.$.active': false
                }},
                (err, user) => {
                    if (err)
                        return callback(err);

                    if (!user)
                        return reply(Boom.badRequest('This token does not belong to you'));

                    return reply({
                        message: 'Success'
                    });
                }
            )
        }
    ],
    err => {
        if (err)
            return reply(Boom.badImplementation(err));
    });
};