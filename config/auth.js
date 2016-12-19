const jwt = require('jsonwebtoken');
const secret = require('../config/config').secret;

exports.sign = (user, callback) =>
    jwt.sign({
        _id: user._id,
        role: user.role,
        date: new Date()
    }, secret, {
        algorithm: require('./config').jwt.alg
    }, (err, token) => {
        if (err)
            return callback(err);
        return callback(null, token);
    });

exports.verify = (token, callback) =>
    jwt.verify(token, secret, (err, decoded) => {
        if (err)
            return callback(err);
        return callback(null, decoded);
    });