const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const geocoder = require('../config/maps');

const RestaurantSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    location: {
        type: {
            lat: {
                type: Number,
                min: -90,
                max: 90,
                required: true
            },
            lng: {
                type: Number,
                min: -180,
                max: 180,
                required: true
            },
            country: {
                type: String,
                required: true
            },
            city: {
                type: String,
                required: true
            },
            street: {
                name: {
                    type: String,
                    required: true
                },
                number: {
                    type: Number,
                    min: 1,
                    required: true
                }
            }
        },
        required: true
    },
    halls: [{
        name: {
            type: String,
            required: true
        },
        plan: {
            type: Schema.Types.Mixed,
            default: null
        },
        tables: [{
            places: {
                type: Number,
                required: true
            },
            cords: {
                x: {
                    type: Number,
                    required: true
                },
                y: {
                    type: Number,
                    required: true
                },
                width: {
                    type: Number,
                    required: true
                },
                height: {
                    type: Number,
                    required: true
                }
            }
        }]
    }],
    owner: {
        type: Schema.Types.ObjectId,
        required: true
    }
});

RestaurantSchema.pre('save', function (next) {
    let restaurant = this;

    if (!restaurant.isModified('location.address'))
        return next();

    geocoder.geocode(restaurant.location.address, (err, location) => {
        if (err)
            return next(err);

        if (!location.length)
            return next(new Error('Invalid address'));

        location = location[0];
        restaurant.location = {
            lat: location.latitude,
            lng: location.longitude,
            country: location.country,
            city: location.city,
            street: {
                name: location.streetName,
                number: location.streetNumber
            }
        };

        return next();
    });
});

const Restaurant = mongoose.model('Restaurant', RestaurantSchema);