const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RestaurantSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    location: {
        lat: {
            type: Number,
            required: true
        },
        lng: {
            type: Number,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        }
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
    typeMeals: {
        type: [String]
    }
});

const Restaurant = mongoose.model('Restaurant', RestaurantSchema);