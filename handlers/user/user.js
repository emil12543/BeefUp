const Boom = require('boom');
const async = require('async');
const auth = require('../../config/auth');
const generatePassword = require('password-generator');
const mongoose = require('mongoose');
const UserModel = mongoose.model('User');
const RestaurantModel = mongoose.model('Restaurant');
const Restaurant = require('../restaurant');
const memory = require('../../config/memory');
const handleResponse = require('../helpers').handleResponse;
const verifyPassword = require('./helpers').verifyPassword;
const isStaff = require('./helpers').isStaff;

class User {
    static findById(id, callback) {
        UserModel.findById(id, '-hash -password', (err, user) => {
            if (err)
                return callback(err);

            if (!user)
                return callback(new Error('No user'));

            return callback(null, user);
        });
    }

    static create(request, reply) {
        const user = new UserModel(request.payload);
        user.save(user, (err, user) => {
            handleResponse(err, reply, {
                fields: ['_id'],
                data: user
            });
        });
    }

    static getOne(request, reply) {
        User.findById(request.auth.credentials._id, (err, user) => {
            handleResponse(err, reply, {
                data: user
            });
        });
    }

    static update(request, reply) {
        async.waterfall([
                callback => {
                    UserModel.findById(request.auth.credentials._id, callback);
                },
                (user, callback) => {
                    verifyPassword(user, request.payload.currentPassword, callback);
                },
                (user, callback) => {
                    user.username = request.payload.username || user.username;
                    user.password = request.payload.password || user.password;
                    if (request.payload.name) {
                        user.name.first = request.payload.name.first || user.name.first;
                        user.name.last = request.payload.name.last || user.name.last;
                    }
                    user.email = request.payload.email || user.email;

                    user.save(callback);
                }
            ], err => handleResponse(err, reply)
        );
    }

    static getToken(request, reply) {
        async.waterfall([
                callback => {
                    UserModel.find({
                        username: request.payload.username
                    }, callback);
                },
                (users, callback) => {
                    if (!users.length)
                        return callback(new Error('Wrong username'));

                    const user = users[0];
                    verifyPassword(user, request.payload.password, callback);
                },
                (user, callback) => {
                    auth.sign({
                        _id: user._id,
                        role: user.role
                    }, (err, token) => {
                        if (err)
                            return callback(err);

                        memory.add(token, user._id);
                        return callback(null, user, token);
                    });
                },
                (user, token, callback) => {
                    user.tokens.push({
                        token,
                        device: request.headers['user-agent'],
                        address: request.info.remoteAddress
                    });

                    user.save(err => {
                        if (err)
                            return callback(err);

                        return callback(null, token);
                    });
                }
            ], (err, token) => handleResponse(err, reply, {
                data: {
                    token: token
                }
            })
        );
    }

    static revokeToken(request, reply) {
        async.waterfall([
                callback => {
                    auth.verify(request.payload.token, (err, decoded) => {
                        if (err)
                            return reply(Boom.badData('Invalid token'));

                        if (request.payload.token == request.headers.authorization)
                            return reply(Boom.badData('The token and the Authorization token are the same'));

                        if (decoded._id != request.auth.credentials._id)
                            return reply(Boom.unauthorized('You are not authorized to revoke this token'));

                        memory.remove(request.payload.token);
                        callback(null, decoded, request.payload.token);
                    });
                },
                (decoded, token, callback) => {
                    UserModel.findByIdAndUpdate(
                        decoded._id,
                        {
                            $pull: {
                                tokens: {
                                    token: token
                                }
                            }
                        }, (err) => {
                            if (err)
                                return callback(err);

                            return callback(null);
                        });
                }
            ], err => handleResponse(err, reply)
        );
    }

    static addStaff(request, reply) {
        let password;
        async.waterfall([
                callback => {
                    Restaurant.findById(request.payload.restaurant_id, request.auth.credentials._id, callback);
                },
                (restaurant, callback) => {
                    password = generatePassword(8);
                    const user = new UserModel(Object.assign({}, request.payload, {
                        password
                    }));

                    user.save(callback);
                }
            ], (err, user) => handleResponse(err, reply, {
                data: {
                    _id: user._id,
                    username: user.username,
                    password
                }
            })
        );
    }

    static getStaff(request, reply) {
        async.waterfall([
                callback => {
                    User.findById(request.params.id, callback);
                },
                (user, callback) => {
                    isStaff(user, reply, callback);
                },
                (user, callback) => {
                    Restaurant.findById(user.restaurant_id, null, null, reply, err => {
                        if (err)
                            return callback(err);

                        return callback(null, user);
                    });
                }
            ], (err, user) => handleResponse(err, reply, {
                data: user
            })
        );
    }

    static updateStaff(request, reply) {
        let password;
        async.waterfall([
                callback => {
                    User.findById(request.params.id, callback);
                },
                (user, callback) => {
                    isStaff(user, reply, callback);
                },
                (user, callback) => {
                    Restaurant.findById(user.restaurant_id, request.auth.credentials._id, err => {
                        if (err)
                            return callback(err);

                        return callback(null, user);
                    });
                },
                (user, callback) => {
                    user.username = request.payload.username || user.username;
                    if (request.payload.password) {
                        password = generatePassword(8);
                        user.password = password;
                    }
                    if (request.payload.name) {
                        user.name.first = request.payload.name.first || user.name.first;
                        user.name.last = request.payload.name.last || user.name.last;
                    }
                    user.email = request.payload.email || user.email;
                    user.role = request.payload.role || user.role;

                    user.save((err, user) => {
                        if (err)
                            return callback(err);

                        let data = user.username;
                        if (password)
                            data.password = password;
                    });
                }
            ], (err, user) => handleResponse(err, reply, {
                data: user
            })
        );
    }

    static removeStaff(request, reply) {
        async.waterfall([
                callback => {
                    User.findById(request.params.id, callback);
                },
                (user, callback) => {
                    isStaff(user, reply, callback);
                },
                (user, callback) => {
                    Restaurant.findById(user.restaurant_id, null, null, reply, err => {
                        if (err)
                            return callback(err);

                        return callback(null, user);
                    });
                },
                (user, callback) => {
                    user.remove(err => {
                        if (err)
                            return callback(err);

                        return callback();
                    });
                }
            ], err => handleResponse(err, reply)
        );
    }
}

module.exports = User;