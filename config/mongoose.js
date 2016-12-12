const mongoose = require('mongoose');
const User = require('../models/user');

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