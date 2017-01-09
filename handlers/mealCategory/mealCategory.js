const Boom = require('boom');
const async = require('async');
const mongoose = require('mongoose');
const RestaurantModel = mongoose.model('Restaurant');
const MealCategoryModel = mongoose.model('MealCategory');
const Restaurant = require('../restaurant');
const handleResponse = require('../helpers').handleResponse;

class MealCategory {
    static findById(id, protect, callback) {
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
                    Restaurant.findById(request.params.restaurant_id, request.auth.credentials._id, callback);
                },
                (restaurant, callback) => {
                    MealCategoryModel.find({}, callback);
                },
                (categories, callback) => {
                    if (!categories.length)
                        return callback(null, false);
                    else {
                        if (categories[0].restaurant_ids.indexOf(request.params.restaurant_id) > -1)
                            return callback(new Error('This category already exists'));

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
                        category.save(err => {
                            if (err)
                                return callback(err);

                            return callback(null, category);
                        });
                    }
                }
            ], (err, category) => handleResponse(err, reply, {
                data: {
                    _id: category._id
                }
            })
        )
    }

    static update(request, reply) {
        async.waterfall([
                callback => {
                    Restaurant.findById(request.params.restaurant_id, request.auth.credentials._id, callback);
                },
                (restaurant, callback) => {
                    MealCategory.findById(request.params.id, request.params.restaurant_id, callback);
                },
                (category, callback) => {
                    if (category.restaurant_ids.length == 1)
                        category.remove();
                    else
                        category.restaurant_ids = category.restaurant_ids.filter(id => id != request.params.restaurant_id);

                    return callback(null, category);
                },
                (category, callback) => {
                    category.save(err => {
                        if (err)
                            return callback(err);

                        return callback(null, category);
                    });
                },
                (category, callback) => {
                    MealCategoryModel.find({
                        title: request.payload.title
                    }, callback);
                },
                (categories, callback) => {
                    let category = categories[0];
                    if (!!category)
                        category.restaurant_ids.push(request.params.restaurant_id);
                    else
                        category = new MealCategoryModel({
                            title: request.payload.title,
                            restaurant_ids: request.params.restaurant_id
                        });

                    category.save(err => {
                        if (err)
                            return callback(err);

                        return callback(null, category);
                    });
                }
            ], (err, category) => handleResponse(err, reply, {
                data: {
                    _id: category._id
                }
            })
        )
    }

    static get(request, reply) {
        async.waterfall([
                callback => {
                    Restaurant.findById(request.params.restaurant_id, request.auth.credentials._id, callback);
                },
                (restaurant, callback) => {
                    MealCategoryModel.find({
                        restaurant_ids: request.params.restaurant_id
                    }, '-restaurant_ids', callback);
                }
            ], (err, categories) => handleResponse(err, reply, {
                data: categories
            })
        );
    }

    static remove(request, reply) {
        async.waterfall([
                callback => {
                    Restaurant.findById(request.params.restaurant_id, request.auth.credentials._id, callback);
                },
                (restaurant, callback) => {
                    MealCategory.findById(request.params.id, request.params.restaurant_id, callback);
                },
                (category, callback) => {
                    if (category.restaurant_ids.length == 1)
                        category.remove();
                    else
                        category.restaurant_ids = category.restaurant_ids.filter(id => id != request.params.restaurant_id);

                    return callback(null, category);
                },
                (category, callback) => {
                    category.save(err => {
                        if (err)
                            return callback(err);

                        return callback(null, err);
                    });
                }
            ], err => handleResponse(err, reply)
        );
    }
}

module.exports = MealCategory;