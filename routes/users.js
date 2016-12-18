const userController = require('../controllers/userController');

const routes = [
    {
        path: '/users',
        method: 'GET',
        config: userController.getAll
    },
    {
        path: '/users',
        method: 'POST',
        config: userController.create
    },
    {
        path: '/users/{id}',
        method: 'GET',
        config: userController.getOne
    },
    {
        path: '/users/{id}',
        method: 'DELETE',
        config: userController.remove
    },
    {
        path: '/users/login/{id}',
        method: 'GET',
        config: userController.login
    },
    {
        path: '/users/revoke',
        method: 'POST',
        config: userController.revokeToken
    }
];

module.exports = routes;