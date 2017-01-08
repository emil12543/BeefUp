const Boom = require('boom');
const async = require('async');
const mongoose = require('mongoose');
const RestaurantModel = mongoose.model('Restaurant');
const MealCategoryModel = mongoose.model('MealCategory');
const Restaurant = require('../restaurant');

class MealCategory {
    static save(category, callback) {
        category.save(err => {
            if (err)
                return callback(err);

            return callback(null, category);
        });
    }

    static find(query, fields, options, callback) {
        MealCategoryModel.find(query, fields, options, (err, categories) => {
            if (err)
                return callback(err);

            return callback(null, categories);
        });
    }

    static findById(id, protect, reply, callback) {
        MealCategoryModel.findById(id, (err, category) => {
            if (err)
                return callback(err);

            if (!category)
                return reply(Boom.badData('There is no such category'));

            if (protect && category.restaurant_ids.indexOf(protect) == -1)
                return reply(Boom.unauthorized('You are not authorized to edit this category'));

            return callback(null, category);
        });
    }

    static create(request, reply) {
        async.waterfall([
            callback => {
                Restaurant.findById(request.params.restaurant_id, null, request.auth.credentials._id, reply, callback);
            },
            (restaurant, callback) => {
                MealCategory.find({}, null, null, callback);
            },
            (categories, callback) => {
                if (!categories.length)
                    return callback(null, false);
                else {
                    if (categories[0].restaurant_ids.indexOf(request.params.restaurant_id) > -1)
                        return reply(Boom.badData('This category already exists'));

                    return callback(null, categories[0]);
                }
            },
            (category, callback) => {
                if (!!category) {
                    category.restaurant_ids.push(request.params.restaurant_id);
                    MealCategory.save(category, callback);
                }
                else {
                    const category = new MealCategoryModel({
                        title: request.payload.title,
                        restaurant_ids: request.params.restaurant_id
                    });
                    MealCategory.save(category, callback);
                }
            }
        ], (err, category) => {
            if (err)
                return reply(Boom.badImplementation(err));

            return reply({
                _id: category._id
            });
        });
    }

    static update(request, reply) {
        async.waterfall([
            callback => {
                Restaurant.findById(request.params.restaurant_id, null, request.auth.credentials._id, reply, callback);
            },
            (restaurant, callback) => {
                MealCategory.findById(request.params.id, request.params.restaurant_id, reply, callback);
            },
            (category, callback) => {
                if (category.restaurant_ids.length == 1)
                    category.remove();
                else
                    category.restaurant_ids = category.restaurant_ids.filter(id => id != request.params.restaurant_id);

                return callback(null, category);
            },
            (category, callback) => {
                MealCategory.save(category, callback);
            },
            (category, callback) => {
                MealCategory.find({
                    title: request.payload.title
                }, null, null, callback);
            },
            (categories, callback) => {
                let category = categories[0];
                if (!!category) {
                    category.restaurant_ids.push(request.params.restaurant_id);
                    MealCategory.save(category, callback);
                } else {
                    const category = new MealCategoryModel({
                        title: request.payload.title,
                        restaurant_ids: request.params.restaurant_id
                    });
                    MealCategory.save(category, callback);
                }
            }
        ], (err, category) => {
            if (err)
                return reply(Boom.badImplementation(err));

            return reply({
                _id: category._id
            });
        });
    }

    static get(request, reply) {
        async.waterfall([
            callback => {
                Restaurant.findById(request.params.restaurant_id, null, request.auth.credentials._id, reply, callback);
            },
            (restaurant, callback) => {
                MealCategoryModel.find({
                    restaurant_ids: request.params.restaurant_id
                }, '-restaurant_ids', callback);
            }
        ], (err, categories) => {
            if (err)
                return reply(Boom.badImplementation(err));

            return reply(categories);
        });
    }

    static remove(request, reply) {
        async.waterfall([
            callback => {
                Restaurant.findById(request.params.restaurant_id, null, request.auth.credentials._id, reply, callback);
            },
            (restaurant, callback) => {
                MealCategory.findById(request.params.id, request.params.restaurant_id, reply, callback);
            },
            (category, callback) => {
                if (category.restaurant_ids.length == 1)
                    category.remove();
                else
                    category.restaurant_ids = category.restaurant_ids.filter(id => id != request.params.restaurant_id);

                return callback(null, category);
            },
            (category, callback) => {
                MealCategory.save(category, callback);
            }
        ], err => {
            if (err)
                return reply(Boom.badImplementation(err));

            return reply({
                message: 'Success'
            });
        });
    }
}

module.exports = MealCategory;