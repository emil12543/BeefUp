const Joi = require('joi');
const User = require('../handlers/user').User;
const Staff = require('../handlers/user').Staff;

module.exports = [
    {
        path: '/users',
        method: 'GET',
        config: {
            auth: 'jwt',
            handler: User.getOne
        }
    },
    {
        path: '/users',
        method: 'PUT',
        config: {
            auth: {
                strategy: 'jwt',
                scope: ['normal', 'owner']
            },
            handler: User.update,
            validate: {
                payload: {
                    username: Joi.string().alphanum().min(4).max(24),
                    password: Joi.string().min(6).max(48),
                    name: Joi.object({
                        first: Joi.string(),
                        last: Joi.string()
                    }),
                    email: Joi.string().email(),
                    currentPassword: Joi.string().required()
                }
            }
        }
    },
    {
        path: '/auth/signup',
        method: 'POST',
        config: {
            auth: false,
            handler: User.create,
            validate: {
                payload: {
                    username: Joi.string().alphanum().min(4).max(24).required(),
                    password: Joi.string().min(6).max(48).required(),
                    name: Joi.object({
                        first: Joi.string().required(),
                        last: Joi.string().required()
                    }).required(),
                    email: Joi.string().email().required(),
                    role: Joi.string()
                }
            }
        }
    },
    {
        path: '/auth/login',
        method: 'POST',
        config: {
            auth: false,
            handler: User.getToken,
            validate: {
                payload: {
                    username: Joi.string().required(),
                    password: Joi.string().required()
                }
            }
        }
    },
    {
        path: '/auth/revoke',
        method: 'POST',
        config: {
            auth: 'jwt',
            handler: User.revokeToken,
            validate: {
                payload: {
                    token: Joi.string().required()
                }
            }
        }
    },
    {
        path: '/staff',
        method: 'POST',
        config: {
            auth: {
                strategy: 'jwt',
                scope: 'owner'
            },
            handler: Staff.addStaff,
            validate: {
                payload: {
                    username: Joi.string().alphanum().min(4).max(24).required(),
                    name: Joi.object({
                        first: Joi.string().required(),
                        last: Joi.string().required()
                    }).required(),
                    email: Joi.string().email().required(),
                    role: Joi.string().valid('waiter', 'barman', 'cook', 'cashier').required(),
                    restaurant_id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
                }
            }
        }
    },
    {
        path: '/staff/{id}',
        method: 'PUT',
        config: {
            auth: {
                strategy: 'jwt',
                scope: 'owner'
            },
            handler: Staff.updateStaff,
            validate: {
                params: {
                    id: Joi.string().regex(/^[0-9a-fA-F]{24}$/)
                },
                payload: {
                    username: Joi.string().alphanum().min(4).max(24),
                    name: Joi.object({
                        first: Joi.string(),
                        last: Joi.string()
                    }),
                    email: Joi.string().email(),
                    role: Joi.string().valid('waiter', 'barman', 'cook', 'cashier'),
                    password: Joi.boolean()
                        .truthy('true')
                        .falsy('false')
                }
            }
        }
    },
    {
        path: '/staff/{id}',
        method: 'GET',
        config: {
            auth: {
                strategy: 'jwt',
                scope: 'owner'
            },
            handler: Staff.getStaff,
            validate: {
                params: {
                    id: Joi.string().regex(/^[0-9a-fA-F]{24}$/)
                }
            }

        }
    },
    {
        path: '/staff/{id}',
        method: 'DELETE',
        config: {
            auth: {
                strategy: 'jwt',
                scope: 'owner'
            },
            handler: Staff.removeStaff,
            validate: {
                params: {
                    id: Joi.string().regex(/^[0-9a-fA-F]{24}$/)
                }
            }
        }
    },
];