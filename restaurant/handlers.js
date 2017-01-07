const Boom = require('boom');
const async = require('async');
const mongoose = require('mongoose');
const RestaurantModel = mongoose.model('Restaurant');

// exports.create = (request, reply) => {
//     Restaurant.create({
//         name: request.payload.name,
//         location: {
//             address: request.payload.location.address
//         },
//         owner: request.auth.credentials._id
//     }, (err, restaurant) => {
//         if (err) {
//             if (err.message == 'Invalid address')
//                 return reply(Boom.badData(err.message));
//
//             return reply(Boom.badImplementation(err));
//         }
//
//         return reply({
//             _id: restaurant._id
//         });
//     });
// };
//
// exports.update = (request, reply) => {
//     async.waterfall([
//         callback => {
//             Restaurant.findById(request.params.id, (err, restaurant) => {
//                 if (err)
//                     return callback(err);
//
//                 if (!restaurant)
//                     return reply(Boom.badData('There is no such restaurant'));
//
//                 if (restaurant.owner != request.auth.credentials._id)
//                     return reply(Boom.unauthorized('You are not authorized to edit this restaurant'));
//
//                 restaurant.name = request.payload.name || restaurant.name;
//                 if (request.payload.location)
//                     restaurant.location = {
//                         address: request.payload.location.address
//                     };
//
//                 return callback(null, restaurant);
//             });
//         },
//         (restaurant, callback) => {
//             restaurant.save(err => {
//                 if (err) {
//                     if (err.message == 'Invalid address')
//                         return reply(Boom.badData(err.message));
//
//                     return callback(err);
//                 }
//
//                 return reply({
//                     message: 'Success'
//                 });
//             });
//         }
//     ], err => {
//         if (err)
//             return reply(Boom.badImplementation(err));
//     });
// };
//
// exports.delete = (request, reply) => {
//     async.waterfall([
//         callback => {
//             Restaurant.findById(request.params.id, (err, restaurant) => {
//                 if (err)
//                     return callback(err);
//
//                 if (!restaurant)
//                     return reply(Boom.badData('There is no such restaurant'));
//
//                 if (restaurant.owner != request.auth.credentials._id)
//                     return reply(Boom.unauthorized('You are not authorized to delete this restaurant'));
//
//                 return callback(null, restaurant);
//             });
//         },
//         (restaurant, callback) => {
//             restaurant.remove(err => {
//                 if (err)
//                     return callback(err);
//
//                 return reply({
//                     message: 'Success'
//                 });
//             });
//         }
//     ], err => {
//         if (err)
//             return reply(Boom.badImplementation(err));
//     });
// };
//
// exports.get = (request, reply) => {
//     let options = request.auth.credentials.scope == 'owner' ? {
//             owner: request.auth.credentials._id
//         } : {};
//
//     if (request.query) {
//         if (request.query.country) {
//             options = Object.assign({}, options, {
//                 'location.country': request.query.country
//             });
//         }
//         if (request.query.city) {
//             options = Object.assign({}, options, {
//                 'location.city': request.query.city
//             });
//         }
//     }
//
//     Restaurant.find(
//         options, (err, restaurants) => {
//         if (err)
//             return reply(Boom.badImplementation(err));
//
//         if (!restaurants.length)
//             return reply(Boom.badData((request.auth.credentials.scope == 'owner' ? 'You haven\'t registered any restaurants yet' : 'There aren\'t any restaurants') + (options['location.country'] || options['location.city'] ? ' in this area' : '')));
//
//         return reply(restaurants);
//     });
// };
//
// exports.getOne = (request, reply) => {
//     Restaurant.findById(request.params.id, (err, restaurant) => {
//         if (err)
//             return reply(Boom.badImplementation(err));
//
//         return reply(restaurant);
//     });
// };

class Restaurant {
    static save(restaurant, reply, callback) {
        restaurant.save(err => {
            if (err) {
                if (err.message == 'Invalid address')
                    return reply(Boom.badData(err.message));

                return callback(err);
            }

            return callback(null, restaurant);
        });
    }

    static find(query, fields, reply, callback) {
        RestaurantModel.find(query, fields, (err, restaurants) => {
            if (err)
                return callback(err);

            if (!restaurants.length)
                return reply(Boom.badImplementation('No results'));

            return callback(null, restaurants);
        });
    }

    static findById(id, fields, protect, reply, callback) {
        RestaurantModel.findById(id, fields, (err, restaurant) => {
            if (err)
                return callback(err);

            if (!restaurant)
                return reply(Boom.badData('There is no such restaurant'));

            if (protect)
                if (restaurant.owner != protect)
                    return reply(Boom.unauthorized('You must be the owner to this restaurant'));

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
        Restaurant.save(restaurant, reply, (err, restaurant) => {
             if (err)
                 return reply(Boom.badImplementation(err));

             return reply(restaurant);
        });
    }

    static getOne(request, reply) {
        Restaurant.findById(request.params.id, null, null, (err, restaurant) => {
            if (err)
                return reply(Boom.badImplementation(err));

            return restaurant;
        });
    }

    static update(request, reply) {
        async.waterfall([
            callback => {
                Restaurant.findById(request.params.id, null, request.auth.credentials._id, reply, callback);
            },
            (restaurant, callback) => {
                restaurant.name = request.payload.name || restaurant.name;
                if (request.payload.location)
                    restaurant.location = {
                        address: request.payload.location.address
                    };

                Restaurant.save(restaurant, reply, callback);
            }
        ], err => {
            if (err)
                return reply(Boom.badImplementation(err));

            return reply({
                message: 'Success'
            });
        });
    }

    static remove(request, reply) {
        async.waterfall([
            callback => {
                Restaurant.findById(request.params.id, null, request.auth.credentials._id, reply, callback);
            },
            (restaurant, callback) => {
                restaurant.remove(err => {
                    if (err)
                        return callback(err);

                    return callback(null, err);
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

        Restaurant.find(query, null, reply, (err, restaurants) => {
            if (err)
                return reply(Boom.badImplementation(err));

            return reply(restaurants);
        });
        // RestaurantModel.find(
        //     fields, (err, restaurants) => {
        //     if (err)
        //         return reply(Boom.badImplementation(err));
        //
        //     if (!restaurants.length)
        //         return reply(Boom.badData((request.auth.credentials.scope == 'owner' ? 'You haven\'t registered any restaurants yet' : 'There aren\'t any restaurants') + (options['location.country'] || options['location.city'] ? ' in this area' : '')));
        //
        //     return reply(restaurants);
        // });
    }
}

module.exports = Restaurant;