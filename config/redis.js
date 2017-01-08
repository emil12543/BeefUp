const Redis = require('ioredis');
let redis = new Redis();

exports.addItem = (field, value) => (redis.set(field, value));
exports.getItem = field => (redis.get(field));
exports.deleteItem = field => (redis.del(field));
