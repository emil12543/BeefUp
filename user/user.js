const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    nickname: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    hash: {
        type: String,
        required: true
    },
    tokens: [{
        token: {
            type: String,
            required: true
        },
        device: {
            type: String,
            required: true
        },
        active: {
            type: Boolean,
            default: true
        }
    }],
    name: {
        first: {
            type: String,
            required: true
        },
        last: {
            type: String,
            required: true
        }
    },
    email: {
        type: String,
        required: true
    },
    role: {
        type: String, // normal, waiter, barman, cook, owner
        default: 'normal'
    },
    restaurant_id: {
        type: Schema.Types.ObjectId, // for workers => in which restaurant they work | for users => in which restaurant they are
        default: null
    }
});

const User = mongoose.model('User', UserSchema);