const Boom = require('boom');
const async = require('async');
const auth = require('../../config/auth');
const generatePassword = require('password-generator');
const mongoose = require('mongoose');
const UserModel = mongoose.model('User');
const RestaurantModel = mongoose.model('Restaurant');
const Restaurant = require('../restaurant');
const Redis = require('ioredis');
const redis = new Redis();

class User {    
    static save(user, reply, callback) {
        user.save(err => {
            if (err)
                return callback(err);

            return callback(null, user);
        });
    }

    static verifyPassword(user, password, reply, callback) {
        user.verifyPassword(password, (err, isMatch) => {
            if (err)
                return callback(err);

            if (!isMatch)
                return reply(Boom.unauthorized('Wrong password'));

            return callback(null, user);
        });
    }

    static find(query, fields, callback) {
        UserModel.find(query, fields, (err, users) => {
            if (err)
                return callback(err);

            return callback(null, users);
        });
    }

    static findById(id, fields, reply, callback) {
        UserModel.findById(id, fields, (err, user) => {
            if (err)
                return callback(err);

            if (!user)
                return reply(Boom.badData('There is no such user'));

            return callback(null, user);
        });
    }

    static findByUsername(username, reply, callback) {
        UserModel.findOne({
            username
        }, (err, user) => {
            if (err)
                return callback(err);

            if (!user)
                return reply(Boom.unauthorized('Wrong username or password'));

            return callback(null, user);
        });
    }

    static create(request, reply) {
        async.waterfall([
            callback => {
                User.find({
                    username: request.payload.username
                }, null, (err, users) => {
                    if (err)
                        return callback(err);

                    if (!!users.length)
                        return reply(Boom.badData('This username is already taken'));

                    return callback();
                });
            },
            callback => {
                User.find({
                    email: request.payload.email
                }, null, (err, users) => {
                    if (err)
                        return callback(err);

                    if (!!users.length)
                        return reply(Boom.badData('There is already a user with this email'));

                    return callback();
                });
            },
            callback => {
                const user = new UserModel(request.payload);
                User.save(user, reply, (err, user) => {
                    if (err)
                        return callback(err);

                    return callback(null, user);
                });
            }
        ], (err, user) => {
            if (err)
                return reply(Boom.badImplementation(err));

            return reply({
                _id: user._id
            });
        });
    }

    static getOne(request, reply) {
        User.findById(request.auth.credentials._id, '-hash -password', reply, (err, user) => {
            if (err)
                return reply(Boom.badImplementation(err));

            return reply(user);
        });
    }

    static isStaff(user, reply, callback) {
        if (['waiter', 'barman', 'cook', 'cashier'].indexOf(user.role) == -1)
            return reply(Boom.unauthorized('You are not authorized to edit this user'));

        return callback(null, user);
    }

    static update(request, reply) {
        async.waterfall([
            callback => {
                User.findById(request.auth.credentials._id, null, reply, callback);
            },
            (user, callback) => {
                User.verifyPassword(user, request.payload.currentPassword, reply, callback);
            },
            (user, callback) => {
                user.username = request.payload.username || user.username;
                user.password = request.payload.password || user.password;
                if (request.payload.name) {
                    user.name.first = request.payload.name.first || user.name.first;
                    user.name.last = request.payload.name.last || user.name.last;
                }
                user.email = request.payload.email || user.email;

                User.save(user, reply, callback);
            }
        ], err => {
            if (err)
                return reply(Boom.badImplementation(err));

            return reply({
                message: 'Success'
            });
        });
    }

    static getToken(request, reply) {
        async.waterfall([
            callback => {
                User.findByUsername(request.payload.username, reply, callback);
            },
            (user, callback) => {
                User.verifyPassword(user, request.payload.password, reply, callback);
            },
            (user, callback) => {
                auth.sign({
                    _id: user._id,
                    role: user.role
                }, (err, token) => {
                    if (err)
                        return callback(err);

                    redis.set(token, user._id).then(() => {
                        redis.get(token).then((result) => console.log(result));
                    });
                    
                    return callback(null, user, token);
                });
            },
            (user, token, callback) => {
                user.tokens.push({
                    token,
                    device: request.headers['user-agent'],
                    address: request.info.remoteAddress
                });

                User.save(user, reply, (err, user) => {
                    if (err)
                        return callback(err);

                    return callback(null, token);
                });
            }
        ], (err, token) => {
            if (err)
                return reply(Boom.badImplementation(err));

            return reply({
                token: token
            });
        });
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

                    redis.deleteItem(request.payload.token);
                    // TODO: check if the delete action is done correctly
                    // think about swap the funcs
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
        ], err => {
            if (err)
                return reply(Boom.badImplementation(err));

            return reply({
                message: 'Success'
            });
        });
    }

    static addStaff(request, reply) {
        async.waterfall([
            callback => {
                Restaurant.findById(request.payload.restaurant_id, null, request.auth.credentials._id, reply, callback);
            },
            (restaurant, callback) => {
                const password = generatePassword(8);
                const user = new UserModel({
                    username: request.payload.username,
                    password: password,
                    name: {
                        first: request.payload.name.first,
                        last: request.payload.name.last
                    },
                    role: request.payload.role,
                    email: request.payload.email,
                    restaurant_id: request.payload.restaurant_id
                });

                User.save(user, reply, (err, user) => {
                    if (err)
                        return callback(err);

                    return callback(null, {
                        _id: user._id,
                        username: user.username,
                        password
                    });
                });
            }
        ], (err, user) => {
            if (err)
                return reply(Boom.badImplementation(err));

            return reply({
                _id: user._id,
                username: user.username,
                password: user.password
            });
        })
    }

    static updateStaff(request, reply) {
        async.waterfall([
            callback => {
                User.findById(request.params.id, null, reply, callback);
            },
            (user, callback) => {
                User.isStaff(user, reply, callback);
            },
            (user, callback) => {
                Restaurant.findById(user.restaurant_id, null, request.auth.credentials._id, reply, err => {
                    if (err)
                        return callback(err);

                    return callback(null, user);
                });
            },
            (user, callback) => {
                user.username = request.payload.username || user.username;
                let password;
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

                User.save(user, reply, (err, user) => {
                    if (err)
                        return callback(err);

                    return callback(null, {
                        username: user.username,
                        password
                    });
                });
            }
        ], (err, user) => {
            if (err)
                return reply(Boom.badImplementation(err));

            return reply({
                username: user.username,
                password: user.password
            })
        });
    }

    static getStaff(request, reply) {
        async.waterfall([
            callback => {
                User.findById(request.params.id, '-hash -passowrd', reply, callback);
            },
            (user, callback) => {
                User.isStaff(user, reply, callback);
            },
            (user, callback) => {
                Restaurant.findById(user.restaurant_id, null, null, reply, err => {
                    if (err)
                        return callback(err);

                    return callback(null, user);
                });
            }
        ], (err, user) => {
            if (err)
                return reply(Boom.badImplementation(err));

            return reply(user);
        });
    }

    static deleteStaff(request, reply) {
        async.waterfall([
            callback => {
                User.findById(request.params.id, null, reply, callback);
            },
            (user, callback) => {
                User.isStaff(user, reply, callback);
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
        ], err => {
            if (err)
                return reply(Boom.badImplementation(err));

            return reply({
                message: 'Success'
            });
        });
    }

    // TODO: get all staff from a restaurant
}

module.exports = User;