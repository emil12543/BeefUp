const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
    items: {
        type: [Schema.Types.ObjectId],
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