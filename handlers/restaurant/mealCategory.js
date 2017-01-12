const async = require('async');
const mongoose = require('mongoose');
const MealCategoryModel = mongoose.model('MealCategory');
const Restaurant = require('./restaurant');
const handleResponse = require('../helpers').handleResponse;

class MealCategory {
    /**
     * @param id
     * @param protect - the restaurant id
     * @param callback
     * @description Search for a mealcategory with the provided id. If the protect restaurant is passed will check if the mealcategory belongs to the restaurant.
     * @return mealcategory model
     * @throws No mealcategory
     * @throws Not authorized to mealcateogry
     */
    static findById(id, protect, callback) {
        MealCategoryModel.findById(id, (err, category) => {
            if (err)
                return callback(err);

            if (!category) // checks if category is found
                return callback(new Error('No mealcategory'));

            if (protect && category.restaurant_ids.indexOf(protect) == -1) // checks if the mealcategory belongs to the restaurant
                return callback(new Error('Not authorized to mealcategory'));

            return callback(null, category);
        });
    }

    static create(request, reply) {
        async.waterfall([
                callback => {
                    Restaurant.findById(request.params.restaurant_id, request.auth.credentials._id, callback); // checks if there is a restaurant with the provided id and if it belongs to the authorized owner
                },
                (restaurant, callback) => {
                    MealCategoryModel.find({
                        title: request.payload.title
                    }, callback); // search for mealcategory with the provided title
                },
                (categories, callback) => {
                    if (!categories.length)
                        return callback(null, false);
                    else { // there is a mealcategory with the same title
                        if (categories[0].restaurant_ids.indexOf(request.params.restaurant_id) > -1) // checks if it belongs to the provided restaurant
                            return callback(new Error('This category already exists'));

                        return callback(null, categories[0]);
                    }
                },
                (category, callback) => {
                    if (!!category) { // checks if there is category
                        category.restaurant_ids.push(request.params.restaurant_id); // add the provided restaurant id to the found mealcategory
                        MealCategory.save(category, callback);
                    }
                    else { // creates new mealcategory
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
                    Restaurant.findById(request.params.restaurant_id, request.auth.credentials._id, callback); // checks if there is a restaurant with the provided id and if it belongs to the authorized owner
                },
                (restaurant, callback) => {
                    MealCategory.findById(request.params.id, request.params.restaurant_id, callback); // checks if there is a mealcategory with the provided id and if it belongs to the found restaurant
                },
                (category, callback) => {
                    if (category.restaurant_ids.length == 1) // remove the category if it belongs only to the found restaurant
                        category.remove();
                    else
                        category.restaurant_ids = category.restaurant_ids.filter(id => id != request.params.restaurant_id); // removes the found restaurant id from the found mealcategory

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
                    }, callback); // search for mealcategory with the provided title
                },
                (categories, callback) => {
                    let category = categories[0];
                    if (!!category) // checks if there is category
                        category.restaurant_ids.push(request.params.restaurant_id); // add the provided restaurant id to the found mealcategory
                    else // creates new mealcategory
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
                    Restaurant.findById(request.params.restaurant_id, request.auth.credentials._id, callback); // checks if there is a mealcategory with the provided if and if it belongs to the found restaurant
                },
                (restaurant, callback) => {
                    MealCategoryModel.find({
                        restaurant_ids: request.params.restaurant_id
                    }, '-restaurant_ids', callback); // exclude the restaurant_ids field
                }
            ], (err, categories) => handleResponse(err, reply, {
                data: categories
            })
        );
    }

    static remove(request, reply) {
        async.waterfall([
                callback => {
                    Restaurant.findById(request.params.restaurant_id, request.auth.credentials._id, callback); // checks if there is a mealcategory with the provided if and if it belongs to the found restaurant
                },
                (restaurant, callback) => {
                    MealCategory.findById(request.params.id, request.params.restaurant_id, callback); // checks if there is a mealcategory with the provided id and if it belongs to the found restaurant
                },
                (category, callback) => {
                    if (category.restaurant_ids.length == 1) // remove the category if it belongs only to the found restaurant
                        category.remove();
                    else
                        category.restaurant_ids = category.restaurant_ids.filter(id => id != request.params.restaurant_id); // removes the found restaurant id from the found mealcategory

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