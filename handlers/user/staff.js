const async = require('async');
const generatePassword = require('password-generator');
const mongoose = require('mongoose');
const User = require('./user');
const UserModel = mongoose.model('User');
const Restaurant = require('../restaurant');
const memory = require('../../config/memory');
const handleResponse = require('../helpers').handleResponse;
const isStaff = require('./helpers').isStaff;
const checkStaffRestaurantOwnership = require('./helpers').checkStaffRestaurantOwnership;

class Staff {
    static addStaff(request, reply) {
        let password;
        async.waterfall([
                callback => {
                    Restaurant.findById(request.payload.restaurant_id, request.auth.credentials._id, callback); // tries to find a restaurant with the provided id and check if the owner of the found restaurant is the same as the authorized user
                },
                (restaurant, callback) => {
                    password = generatePassword(8); // generates a memorable password
                    const user = new UserModel(Object.assign({}, request.payload, { // creates new instance of the User Model
                        password // set the password to be the generated password
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
                    isStaff(user, reply, callback); // checks if the user that should be returned to the owner is staff
                },
                (user, callback) => {
                    checkStaffRestaurantOwnership(user, request.auth.credentials._id, callback)
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
                    checkStaffRestaurantOwnership(user, request.auth.credentials._id, callback)
                },
                (user, callback) => {
                    // set the updated fields
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

                        let data = { // use data to store the staff credentials
                            username: user.username
                        };
                        if (password) // check is new password is generated
                            data.password = password;

                        return callback(null, data);
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
                    checkStaffRestaurantOwnership(user, request.auth.credentials._id, callback)
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

module.exports = Staff;