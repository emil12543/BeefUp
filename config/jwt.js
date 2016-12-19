const redis = require('./redis');

const validate = (decoded, request, callback) => redis.getItem(request.headers.authorization) ? callback(null, true) : callback(null, false);

module.exports = {
    key: require('./config').secret,
    validateFunc: validate,
    verifyOptions: {
        algorithms: [
            require('./config').alg
        ]
    }
};