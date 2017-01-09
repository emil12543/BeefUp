const crypto = require('crypto');
const alg = require('../config/config').encryption.alg;
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: {
        type: String,
        min: 4,
        max: 24,
        match: /^[\w]+$/i,
        unique: true,
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
        unique: true
    },
    role: {
        type: String,
        default: 'normal',
        enum: ['normal', 'waiter', 'barman', 'cook', 'cashier', 'owner']
    },
    restaurant_id: {
        type: Schema.Types.ObjectId, // if the user is staff this field stores in which restaurant they work else it stores in which restaurant they are
        default: null
    }
});

UserSchema.pre('save', function (next) {
    let user = this;

    if (!user.isModified('password'))
        return next();

    let buf = crypto.randomBytes(2048);
    buf = buf.toString('hex');
    crypto.pbkdf2(user.password, buf, 10000, 2048, alg, function (err, key) {
        if (err)
            return next(err);

        user.password = key.toString('hex');
        user.hash = buf;
        return next();
    });
});

UserSchema.methods.verifyPassword = function(password, next) {
    const userPassword = this.password;

    crypto.pbkdf2(password, this.hash, 10000, 2048, alg, function (err, key) {
        if (err)
            return next(err);

        return next(null, key.toString('hex') === userPassword);
    });
};

const User = mongoose.model('User', UserSchema);