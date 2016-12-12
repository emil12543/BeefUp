const env = process.env.NODE_ENV || 'development';

const Hapi = require('hapi');
const config = require('./config/config')[env];

require('./config/mongoose')(config);

const server = new Hapi.Server();
server.connection({ port: 3000 });

server.route(require('./routes'));

server.start(err => {

    if (err)
        throw err;

    console.log(`Server running at: ${server.info.uri}`);
});