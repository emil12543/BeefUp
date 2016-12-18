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
    items: [Schema.Types.ObjectId],
    restaurant_id: {
        type: Schema.Types.ObjectId,
        required: true
    },
    user_id: {
        type: Schema.Types.ObjectId,
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