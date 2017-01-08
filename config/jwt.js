const config = require('./config');
const redis = require('./redis');
const async = require('async');
const User = require('mongoose').model('User');

const validate = (decoded, request, callback) => {
    return redis.getItem(request.headers.authorization) ? callback(null, true) : callback(null, false);
};

module.exports = {
    key: config.secret,
    validateFunc: validate,
    verifyOptions: {
        algorithms: [
            config.jwt.alg
        ]
    }
};

