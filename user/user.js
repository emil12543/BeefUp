const crypto = require('crypto');
const alg = require('../config/config').encryption.alg;
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: {
        type: String,
        min: 4,
        max: 24,
        required: true,
    },
    password: {
        type: String,
        min: 6,
        max: 48,
        required: true
    },
    hash: {
        type: String
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
        address: {
            type: String,
            required: true
        },
        active: {
            type: Boolean,
            default: true
        },
        date: {
            type: Date,
            default: new Date()
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
        min: 6,
        max: 48,
        required: true
    },
    role: {
        type: String,
        default: 'normal',
        enum: ['normal', 'waiter', 'barman', 'cook', 'owner']
    },
    restaurant_id: {
        type: Schema.Types.ObjectId, // for workers => in which restaurant they work | for users => in which restaurant they are
        default: null
    }
});

UserSchema.pre('save', function (callback) {
    let user = this;

    if (!user.isModified('password'))
        return callback();

    let buf = crypto.randomBytes(2048);
    buf = buf.toString('hex');
    const key = crypto.pbkdf2(user.password, buf, 10000, 2048, alg, function (err, key) {
        if (err)
            return callback(err);

        user.password = key.toString('hex');
        user.hash = buf;
        return callback();
    });
});

UserSchema.methods.verifyPassword = function(password, callback) {
    const userPassword = this.password;
    crypto.pbkdf2(password, this.hash, 10000, 2048, alg, function (err, key) {
        if (err)
            return callback(err);

        return callback(null, key.toString('hex') === userPassword);
    });
};

const User = mongoose.model('User', UserSchema);