let db = {};

exports.add = (field, value) => db[field] = value;

exports.get = (field) => db[field];

exports.remove = (field) => delete db[field];