require('dotenv').config();
require('@risingstack/trace');

const config = require('./config/config');
const Hapi = require('hapi');
const server = new Hapi.Server();
server.connection({ port: config.port });

require('./config/mongoose')(config);

server.register([
    {
        register: require('good'),
        options: require('./config/good')
    },
    {
        register: require('hapi-auth-jwt2')
    }
],  err => {
    if (err)
        throw err;

    server.auth.strategy('jwt', 'jwt', true, require('./config/jwt'));

    server.route(require('./config/routes'));
});

server.start(err => {
    if (err)
        throw err;

    console.log(`Server running at: ${server.info.uri}`);
});