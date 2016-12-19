const jwt = require('jsonwebtoken');
const secret = require('../config/config').secret;

exports.sign = (id, callback) =>
    jwt.sign({
        id,
        date: new Date()
    }, secret, {
        algorithm: require('./config').alg
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