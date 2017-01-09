const Boom = require('boom');
const async = require('async');
const mongoose = require('mongoose');
const RestaurantModel = mongoose.model('Restaurant');
const handleResponse = require('../helpers').handleResponse;

class Restaurant {
    static findById(id, protect, callback) {
        RestaurantModel.findById(id, (err, restaurant) => {
            if (err)
                return callback(err);

            if (!restaurant)
                return callback(new Error('No restaurant'));

            if (protect && restaurant.owner != protect)
                return callback(Boom.unauthorized('Not authorized to restaurant'));

            return callback(null, restaurant);
        });
    }

    static create(request, reply) {
        const restaurant = new RestaurantModel({
            name: request.payload.name,
            location: {
                address: request.payload.location.address
            },
            owner: request.auth.credentials._id
        });
        restaurant.save(err => {
            handleResponse(err, reply, {
                data: restaurant
            });
        });
    }

    static getOne(request, reply) {
        Restaurant.findById(request.params.id, null, (err, restaurant) => {
            handleResponse(err, reply, {
                data: restaurant
            });
        });
    }

    static update(request, reply) {
        async.waterfall([
            callback => {
                Restaurant.findById(request.params.id, request.auth.credentials._id, callback);
            },
            (restaurant, callback) => {
                restaurant.name = request.payload.name || restaurant.name;
                if (request.payload.location)
                    restaurant.location = {
                        address: request.payload.location.address
                    };

                restaurant.save(callback);
            }
        ], err => handleResponse(err, reply));
    }

    static remove(request, reply) {
        async.waterfall([
            callback => {
                Restaurant.findById(request.params.id, request.auth.credentials._id, callback);
            },
            (restaurant, callback) => {
                restaurant.remove(err => {
                    if (err)
                        return callback(err);

                    return callback();
                });
            }
        ], err => handleResponse(err, reply));
    }

    static get(request, reply) {
        let query = request.auth.credentials.scope == 'owner' ? {
                owner: request.auth.credentials._id
            } : {};
        if (request.query) {
            if (request.query.country) {
                query = Object.assign({}, query, {
                    'location.country': request.query.country
                });
            }
            if (request.query.city) {
                query = Object.assign({}, query, {
                    'location.city': request.query.city
                });
            }
        }

        RestaurantModel.find(query, (err, restaurants) => {
            handleResponse(err, reply, {
                data: restaurants
            });
        });
    }
}

module.exports = Restaurant;