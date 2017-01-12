const async = require('async');
const mongoose = require('mongoose');
const ItemModel = mongoose.model('Item');
const Restaurant = require('./restaurant');
const MealCategory = require('./mealCategory');
const handleResponse = require('../helpers').handleResponse;

class Item {
    /**
     * @param id
     * @param callback
     * @description Search for an item with the provided id.
     * @throws No item
     */
    static findById(id, callback) {
        ItemModel.findById(id, (err, item) => {
            if (err)
                return callback(err);

            if (!item) // checks if the item is found
                return callback(new Error('No item'));

            return callback(null, item);
        });
    }

    static create(request, reply) {
        async.waterfall([
                callback => {
                    Restaurant.findById(request.payload.restaurant_id, request.auth.credentials._id, callback);
                },
                (restaurant, callback) => {
                    MealCategory.findById(request.payload.mealcategory_id, request.payload.restaurant_id, callback);
                },
                (category, callback) => {
                    const item = new ItemModel(request.payload);
                    item.save(err => {
                        if (err)
                            return callback(err);

                        return callback(null, item);
                    });
                }
            ], (err, item) =>
                handleResponse(err, reply, {
                    data: item
                })
        );
    }

    static getOne(request, reply) {
        Item.findById(request.params.id, (err, item) =>
            handleResponse(err, reply, {
                data: item
            })
        );
    }

    static update(request, reply) {
        async.waterfall([
            callback => {
                Item.findById(request.params.id, callback);
            },
            (item, callback) => {
                Restaurant.findById(item.restaurant_id, request.auth.credentials._id, (err, restaurant) => {
                    if (err)
                        return callback(err);

                    return callback(null, restaurant, item);
                });
            },
            (restaurant, item, callback) => {
                if (request.payload.mealcategory_id)
                    MealCategory.findById(request.payload.mealcategory_id, restaurant._id, callback);
                else
                    return callback(null, item);
            },
            (item, callback) => {
                item.name = request.payload.name || item.name;
                item.time = request.payload.time || item.time;
                item.ingredients = request.payload.ingredients || item.ingredients;
                item.liquid = request.payload.liquid || item.liquid;
                item.mealcategory_id = request.payload.mealcategory_id || item.mealcategory_id;
                item.weight = request.payload.weight || item.weight;
                item.price = request.payload.price || item.price;
                item.save(callback);
            }
        ], err => handleResponse(err, reply));
    }

    static remove(request, reply) {
        async.waterfall([
            callback => {
                Item.findById(request.params.id, callback);
            },
            (item, callback) => {
                Restaurant.findById(item.restaurant_id, request.auth.credentials._id, err => {
                    if (err)
                        return callback(err);

                    return callback(null, item);
                });
            },
            (item, callback) => {
                item.remove(callback);
            }
        ], err => handleResponse(err, reply));
    }
}

module.exports = Item;