const Database = require('jsredis');
const db = new Database();
const config = require('./config');

exports.addItem = (field, value) => db.hsetnx(config.secret, field, value);

exports.getItem = field => db.hget(config.secret, field);

exports.deleteItem = field => db.hdel(config.secret, field);