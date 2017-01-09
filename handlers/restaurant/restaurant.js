const Boom = require('boom');
const async = require('async');
const mongoose = require('mongoose');
const RestaurantModel = mongoose.model('Restaurant');
const handleResponse = require('../helpers').handleResponse;

class Restaurant {
    /**
     * @param id
     * @param protect - the owner id
     * @param callback
     * @description Search for a restaurant with the provided id. If the protect owner is passed will check if the restaurant belongs to the owner.
     * @return restaurant model
     * @throws No restaurant
     * @throws Not authorized to restaurant
     */
    static findById(id, protect, callback) {
        RestaurantModel.findById(id, (err, restaurant) => {
            if (err)
                return callback(err);

            if (!restaurant) // cheks if the restaurant is found
                return callback(new Error('No restaurant'));

            if (protect && restaurant.owner != protect) // checks if the restaurant owner is the same as the provided one
                return callback(Boom.unauthorized('Not authorized to restaurant'));

            return callback(null, restaurant); // returns the callback with the found restaurant
        });
    }

    static create(request, reply) {
        const restaurant = new RestaurantModel({ // creates new instance of the Restaurant Model
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
        Restaurant.findById(request.params.id, null, (err, restaurant) => { // tries to find a restaurant with provided id as parameter with no protection
            handleResponse(err, reply, {
                data: restaurant
            });
        });
    }

    static update(request, reply) {
        async.waterfall([
            callback => {
                Restaurant.findById(request.params.id, request.auth.credentials._id, callback); // checks if there is a restaurant with the provided as parameter with no protection
            },
            (restaurant, callback) => {
                // sets the updated fields
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
                Restaurant.findById(request.params.id, request.auth.credentials._id, callback); // checks if there is a restaurant with the provided as parameter with no protection
            },
            (restaurant, callback) => {
                restaurant.remove(err => { // removes the restaurant
                    if (err)
                        return callback(err);

                    return callback();
                });
            }
        ], err => handleResponse(err, reply));
    }

    static get(request, reply) {
        // checks if the authorized user is owner or normal user
        let query = request.auth.credentials.scope == 'owner' ? {
                owner: request.auth.credentials._id // if the user is owner will search only for restaurants that belongs to the owner
            } : {}; // else will search among all restaurants
        if (request.query) {
            if (request.query.country) { // checks if country is provided
                query = Object.assign({}, query, {
                    'location.country': request.query.country
                });
            }
            if (request.query.city) { // checks if city is provided
                query = Object.assign({}, query, {
                    'location.city': request.query.city
                });
            }
        }

        RestaurantModel.find(query, (err, restaurants) => { // search restaurants that match the created query
            handleResponse(err, reply, {
                data: restaurants
            });
        });
    }
}

module.exports = Restaurant;