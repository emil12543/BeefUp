require('dotenv').config();
const config = require('./config');
const Hapi = require('hapi');
const server = new Hapi.Server();
require('./mongoose')(config);
require('./cron');

const plugins = [
    {
        register: require('good'),
        options: require('./good')
    },
    {
        register: require('hapi-auth-jwt2')
    },
    {
        register: require('../plugins/api'),
        options: {
            routes: require('../routes'),
            strategy: {
                name: 'jwt',
                scheme: 'jwt',
                conf: require('./jwt')
            }
        },
        routes: {
            prefix: '/api/v0'
        }
    }
];

server.connection({
    port: config.server.port,
    routes: {
        cors: true
    }
});

server.register(plugins, err => {
    if (err)
        throw err;

    require('./auth').init();
});

module.exports = server;