const Boom = require('boom');
const async = require('async');
const auth = require('../../config/auth');
const mongoose = require('mongoose');
const UserModel = mongoose.model('User');
const Restaurant = require('../restaurant');
const memory = require('../../config/memory');
const handleResponse = require('../helpers').handleResponse;
const verifyPassword = require('./helpers').verifyPassword;

class User {
    /**
     * @param id
     * @param callback
     * @return user model
     * @description Search for a user with the provided id
     * @throws No User
     */
    static findById(id, callback) {
        UserModel.findById(id, '-hash -password', (err, user) => {
            if (err)
                return callback(err);

            if (!user) // checks if the user is found
                return callback(new Error('No user'));

            return callback(null, user); // returns the callback with the found user
        });
    }

    static create(request, reply) {
        const user = new UserModel(request.payload); // creates new instance of the User model with the provided information from the request
        user.save(user, err => {
            handleResponse(err, reply, {
                fields: ['_id'], // provide the fields that should be returned to the user
                data: user
            });
        });
    }

    static getOne(request, reply) {
        User.findById(request.auth.credentials._id, (err, user) => { // tries to find a user with the id from the authorization token
            handleResponse(err, reply, {
                data: user
            });
        });
    }

    static update(request, reply) {
        async.waterfall([
                callback => {
                    UserModel.findById(request.auth.credentials._id, callback); // gets the User Model of the authorized user
                },
                (user, callback) => {
                    verifyPassword(user, request.payload.currentPassword, callback);
                },
                (user, callback) => {
                    // set the updated fields
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
                        return callback(new Error('Wrong username')); // returns "Wrong username" error if user is not found

                    const user = users[0];
                    verifyPassword(user, request.payload.password, callback);
                },
                (user, callback) => {
                    // creates new jsonwebtoken
                    auth.sign({
                        _id: user._id,
                        role: user.role
                    }, (err, token) => {
                        if (err)
                            return callback(err);

                        memory.add(token, user._id); // add the created jsonwebtoken to the in-memory db
                        return callback(null, user, token);
                    });
                },
                (user, token, callback) => {
                    // add the created jsonwebtoken to the user model
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
                    auth.verify(request.payload.token, (err, decoded) => { // checks if the provided token is valid
                        if (err)
                            return reply(Boom.badData('Invalid token'));

                        if (request.payload.token == request.headers.authorization) // checks if the token that should be revoked is the same with the authorization token
                            return callback(new Error('The tokens are the same'));

                        if (decoded._id != request.auth.credentials._id) // checks if the token that should be revoked is sign the with same id as the authorization token
                            return callback(new Error('Not authorized to revoke token'));

                        memory.remove(request.payload.token); // removes the revoked token from the in-memory db
                        callback(null, decoded, request.payload.token);
                    });
                },
                (decoded, token, callback) => {
                    UserModel.findByIdAndUpdate(
                        decoded._id,
                        {
                            $pull: { // removes the revoked token from the user model
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
}

module.exports = User;