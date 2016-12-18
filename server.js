const Hapi = require('hapi');
const config = require('./config/config');

const server = new Hapi.Server();

server.connection({ port: 3000 });

require('./config/mongoose')(config);

server.register(require('hapi-auth-jwt2'), err => {
    if (err)
        throw err;

    server.auth.strategy('jwt', 'jwt', true, require('./config/jwt'));

    server.route(require('./routes'));
});

server.start(err => {

    if (err)
        throw err;

    console.log(`Server running at: ${server.info.uri}`);
});