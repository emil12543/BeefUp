const config = require('./config');
const async = require('async');
const UserModel = require('mongoose').model('User');

const validate = (decoded, request, callback) => {
    UserModel.find({
        'tokens.token': request.headers.authorization
    }, (err, users) => {
        if (err)
            return callback(err);

        return !!users ? callback(null, true) : callback(null, false);
    });
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

