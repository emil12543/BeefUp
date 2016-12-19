const Boom = require('boom');
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

exports.create = (request, reply) => {
    User.create(request.payload, (err, user) => {
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

exports.getToken = (request, reply) => {
    auth.sign(request.params.id, (err, token) => {
        if (err)
            return reply(Boom.badRequest('Invalid credentials'));

        redis.addItem(token, request.params.id);
        return reply({token: token});
    });
};

exports.revokeToken = (request, reply) => {
    auth.verify(request.payload.token, (err, token) => {
        if (err)
            return reply(Boom.badRequest('Invalid token'));

        if (request.payload.token === request.headers.authorization)
            return reply(Boom.badData('You are not able to revoke the current token! The token and the Authorization token are the same...'));

        if (token.id === request.auth.credentials.id) {
            redis.deleteItem(request.payload.token);
            return reply({
                message: 'Success!'
            });
        } else
            return reply(Boom.unauthorized('You are not authorized to revoke this token!'));
    });
};