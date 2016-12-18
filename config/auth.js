const jwt = require('jsonwebtoken');
const secret = require('../config/config').secret;

exports.sign = id => jwt.sign({
    id,
    date: new Date()
}, secret);

exports.verify = token => jwt.verify(token, secret);