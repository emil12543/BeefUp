const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
    items: {
        type: [{
            item: {
                type: Schema.Types.ObjectId,
                ref: 'Item',
                required: true
            },
            quantity: {
                type: Number,
                default: 1
            }
        }],
        required: true
    },
    received_at: {
        type: Date,
        default: new Date()
    },
    finished_at: {
        type: Date
    }
});

const Order = mongoose.model('Order', OrderSchema);