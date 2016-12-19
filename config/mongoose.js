const mongoose = require('mongoose');
require('./models');

module.exports = config => {
    mongoose.connect(config.db);
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