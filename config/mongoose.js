const mongoose = require('mongoose');
mongoose.plugin(require('mongoose-unique-validator'));
require('./models');

module.exports = (config) => {
    mongoose.Promise = global.Promise;
    mongoose.connect(config.db.uri, {
        config: config.db.config
    });

    const db = mongoose.connection;

    db.once('open', err => {
        if (err)
            throw err;
        console.log("Connection with database succeeded.");
    });

    db.on('error', err => {
        throw err;
    });
};