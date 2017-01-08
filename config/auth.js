const jwt = require('jsonwebtoken');
const config = require('./config');
const memory = require('./memory');
const async = require('async');
const User = require('mongoose').model('User');

const deleteToken = (user, token, callback) => {
    User.findByIdAndUpdate(
        user._id,
        { $pull: {
            tokens: {
                token: token
            }
        }},
        (err) => {
            if (err)
                return callback(err);
        }
    );
};

exports.init = () => {
    async.waterfall([
        callback => {
            User.find({
                tokens: {
                    $ne: null
                }
            }, 'tokens', (err, users) => {
                if (err)
                    return callback(err);
                return callback(null, users);
            });
        },
        (users, callback) => {
            users.map(user => {
                user.tokens.map(token => {
                    this.verify(token.token, (err, decoded) => {
                        if (err)
                            deleteToken(user, token.token, err => {
                                if (err)
                                    return callback(err);
                            });
                        else
                            memory.add(token.token, user._id);
                    });
                });
            });
        }
    ], err => {
        if (err)
            throw err;
    });
};

exports.sign = (user, callback) =>
    jwt.sign({
        _id: user._id,
        scope: user.role,
        date: new Date()
    }, config.secret, {
        algorithm: config.jwt.alg,
        expiresIn: config.jwt.exp
    }, (err, token) => {
        if (err)
            return callback(err);

        return callback(null, token);
    });

exports.verify = (token, callback) =>
    jwt.verify(token, config.secret, (err, decoded) => {
        if (err)
            return callback(err);

        return callback(null, decoded);
    });