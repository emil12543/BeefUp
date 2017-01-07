const Boom = require('boom');
const async = require('async');
const mongoose = require('mongoose');
const RestaurantModel = mongoose.model('Restaurant');
const MealCategoryModel = mongoose.model('MealCategory');
const Restaurant = require('../restaurant/handlers');

class MealCategory {
    static find(query, fields, reply, callback) {
        MealCategoryModel.find(query, fields, (err, categories) => {
            if (err)
                return callback(err);


        });
    }

    static create(request, payload) {
        async.waterfall([
            callback => {
                Restaurant.getById(request.params.restaurant_id, null, request.auth.credentials._id, reply, callback);
            },
            (restaurant, callback) => {

            }
        ], err => {
            if (err)
                return reply(Boom.badImplementation(err));
        });
    }
}

module.exports = MealCategory;

// exports.add = (request, reply) => {
//     async.waterfall([
//         callback => {
//             RestaurantModel.findById(request.params.restaurant_id, (err, restaurant) => {
//                 if (err)
//                     return callback(err);
//
//                 if (!restaurant)
//                     return reply(Boom.badData('There is no such restaurant'));
//
//                 if (restaurant.owner != request.auth.credentials._id)
//                     return callback(Boom.unauthorized('You are not authorized to add meals category to this restaurant'));
//
//                 return callback();
//             });
//         },
//         callback => {
//             MealCategoryModel.find({
//                 title: request.payload.title
//             }, (err, categories) => {
//                 if (err)
//                     return callback(err);
//
//                 if (!categories.length)
//                     return callback(null, false);
//                 else {
//                     if (categories[0].restaurant_ids.indexOf(request.params.restaurant_id) > -1)
//                         return reply(Boom.badData('This category already exists'));
//
//                     return callback(null, categories[0]);
//                 }
//             });
//         },
//         (category, callback) => {
//             if (!!category) {
//                 category.restaurant_ids.push(request.params.restaurant_id);
//                 category.save(err => {
//                     if (err)
//                         return callback(err);
//
//                     return reply({
//                         _id: category._id
//                     });
//                 });
//             }
//             else
//                 MealCategoryModel.create({
//                     title: request.payload.title,
//                     restaurant_ids: request.params.restaurant_id
//                 }, (err, category) => {
//                     if (err)
//                         return callback(err);
//
//                     return reply({
//                         _id: category._id
//                     });
//                 });
//         }
//     ], err => {
//         return reply(Boom.badImplementation(err));
//     });
// };
//
// exports.update = (request, reply) => {
//     async.waterfall([
//         callback => {
//             RestaurantModel.findById(request.params.restaurant_id, (err, restaurant) => {
//                 if (err)
//                     return callback(err);
//
//                 if (!restaurant)
//                     return reply(Boom.badData('There is no such restaurant'));
//
//                 if (restaurant.owner != request.auth.credentials._id)
//                     return callback(Boom.unauthorized('You are not authorized to add meals category to this restaurant'));
//
//                 return callback();
//             });
//         },
//         callback => {
//             MealCategoryModel.findById(request.params.id, (err, category) => {
//                 if (err)
//                     return callback(err);
//
//                 if (!category)
//                     return reply(Boom.badData('There is no such category'));
//
//                 if (category.restaurant_ids.indexOf(request.params.restaurant_id) == -1)
//                     return reply(Boom.unauthorized('You are not authorized to edit this category'));
//
//                 return callback(null, category);
//             });
//         },
//         (category, callback) => {
//             if (category.restaurant_ids.length == 1)
//                 category.remove(err => {
//                     if (err)
//                         return callback(err);
//
//                     return callback();
//                 });
//             else {
//                 category.restaurant_ids = category.restaurant_ids.filter(id => id != request.params.restaurant_id);
//                 category.save(err => {
//                     if (err)
//                         return callback(err);
//
//                     return callback();
//                 });
//             }
//         },
//         callback => {
//             MealCategoryModel.find({
//                 title: request.payload.title
//             }, (err, categories) => {
//                 if (err)
//                     return callback(err);
//
//                 return callback(null, categories[0]);
//             });
//         },
//         (category, callback) => {
//             if (category) {
//                 category.restaurant_ids.push(request.params.restaurant_id);
//                 category.save(err => {
//                     if (err)
//                         return callback(err);
//
//                     return reply({
//                         _id: category._id
//                     });
//                 });
//             }
//             else
//                 MealCategoryModel.create({
//                     title: request.payload.title,
//                     restaurant_ids: request.params.restaurant_id
//                 }, (err, category) => {
//                     if (err)
//                         return callback(err);
//
//                     return reply({
//                         _id: category._id
//                     });
//                 });
//         }
//     ], err => {
//         if (err)
//             return reply(Boom.badImplementation(err));
//     });
// };
//
// exports.get = (request, reply) => {
//     async.series([
//         callback => {
//             RestaurantModel.findById(request.params.restaurant_id, (err, restaurant) => {
//                 if (err)
//                     return callback(err);
//
//                 if (!restaurant)
//                     return reply(Boom.badData('There is no such restaurant'));
//
//                 if (restaurant.owner != request.auth.credentials._id)
//                     return callback(Boom.unauthorized('You are not authorized to add meals category to this restaurant'));
//
//                 return callback();
//             });
//         },
//         callback => {
//             MealCategoryModel.find({
//                 restaurant_ids: request.params.restaurant_id
//             }, '-restaurant_ids', (err, categories) => {
//                 if (err)
//                     return callback(err);
//
//                 if (!categories.length)
//                     return reply(Boom.badData('You haven\'t got any registred categories'));
//
//                 return reply(categories);
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
//             RestaurantModel.findById(request.params.restaurant_id, (err, restaurant) => {
//                 if (err)
//                     return callback(err);
//
//                 if (!restaurant)
//                     return reply(Boom.badData('There is no such restaurant'));
//
//                 if (restaurant.owner != request.auth.credentials._id)
//                     return callback(Boom.unauthorized('You are not authorized to add meals category to this restaurant'));
//
//                 return callback();
//             });
//         },
//         callback => {
//             MealCategoryModel.findById(request.params.id, (err, category) => {
//                 if (err)
//                     return callback(err);
//
//                 if (!category)
//                     return reply(Boom.badData('There is no such category'));
//
//                 if (category.restaurant_ids.indexOf(request.params.restaurant_id) == -1)
//                     return reply(Boom.unauthorized('You are not authorized to edit this category'));
//
//                 return callback(null, category);
//             });
//         },
//         (category, callback) => {
//             if (category.restaurant_ids.length == 1)
//                 category.remove(err => {
//                     if (err)
//                         return callback(err);
//
//                     return reply({
//                         message: 'Success'
//                     });
//                 });
//             else {
//                 category.restaurant_ids = category.restaurant_ids.filter(id => id != request.params.restaurant_id);
//                 category.save(err => {
//                     if (err)
//                         return callback(err);
//
//                     return reply({
//                         message: 'Success'
//                     });
//                 });
//             }
//         }
//
//     ], err => {
//         if (err)
//             return reply(Boom.badImplementation(err));
//     });
// };