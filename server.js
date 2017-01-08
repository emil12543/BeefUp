require('dotenv').config();
const config = require('./config/config');
const Hapi = require('hapi');
const server = new Hapi.Server();
require('./config/mongoose')(config);
require('./config/cron');

const plugins = [
    {
        register: require('good'),
        options: require('./config/good')
    },
    {
        register: require('hapi-auth-jwt2')
    },
    {
        register: require('./plugins/api'),
        options: {
            routes: require('./routes'),
            strategy: {
                name: 'jwt',
                scheme: 'jwt',
                conf: require('./config/jwt')
            }
        },
        routes: {
            prefix: '/api/v1'
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

    require('./config/auth').init();
});

server.start(err => {
    if (err)
        throw err;
    console.log(`Server running at: ${server.info.uri}`);
});