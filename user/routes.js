const Joi = require('joi');
const user = require('./controller');

const routes = [
    {
        path: '/users',
        method: 'GET',
        config: {
            auth: false,
            handler: user.getAll
        }
    },
    {
        path: '/users',
        method: 'POST',
        config: {
            auth: false,
            handler: user.create
        }
    },
    {
        path: '/users/{id}',
        method: 'GET',
        config: {
            auth: false,
            handler: user.getOne
        }
    },
    {
        path: '/users/{id}',
        method: 'DELETE',
        config: {
            auth: 'jwt',
            handler: user.remove
        }
    },
    {
        path: '/users/token',
        method: 'POST',
        config: {
            auth: false,
            handler: user.getToken
        }
    },
    {
        path: '/users/revoke',
        method: 'POST',
        config: {
            auth: 'jwt',
            handler: user.revokeToken
        }
    }
];

module.exports = routes;