const secret = require('./config').secret;
const Database = require('jsredis');
const db = new Database();

exports.addItem = (field, value) => db.hsetnx(secret, field, value);

exports.getItem = field => db.hget(secret, field);

exports.deleteItem = field => db.hdel(secret, field);