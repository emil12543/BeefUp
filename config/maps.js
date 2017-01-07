const config = require('./config');

module.exports = require('node-geocoder')({
    provider: config.maps.provider,
    apiKey: config.maps.key,
});