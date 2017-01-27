const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DiscountSchema = new Schema({
    type: {
        type: String, // full, partial
        required: true
    },
    value: {
        type: Number // if partial => items.price * this (used as percent)
    },
    items: [{
        item: {
            type: Schema.Types.ObjectId,
            ref: 'Item',
            required: true
        },
        quantity: {
            type: Number,
            required: true
        }
    }],
    restaurant_id: {
        type: Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true
    },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    won_on: {
        type: Date
    },
    expires_at: {
        type: Date,
        required: true
    }
});

const Discount = mongoose.model('Discount', DiscountSchema);