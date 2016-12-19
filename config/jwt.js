const redis = require('./redis');
const validate = (decoded, request, callback) => redis.getItem(request.headers.authorization) ? callback(null, true) : callback(null, false);

// TODO: postinstall => put all active tokens from user Model in redis and remove all unactive tokens

module.exports = {
    key: require('./config').secret,
    validateFunc: validate,
    verifyOptions: {
        algorithms: [
            require('./config').jwt.alg
        ]
    }
};