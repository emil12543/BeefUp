const Joi = require('joi');
const Restaurant = require('../handlers/restaurant');

module.exports = [
    {
        path: '/restaurants',
        method: 'GET',
        config: {
            auth: 'jwt',
            handler: Restaurant.get
        }
    },
    {
        path: '/restaurants',
        method: 'POST',
        config: {
            auth: {
                strategy: 'jwt',
                scope: 'owner'
            },
            handler: Restaurant.create,
            validate: {
                payload: {
                    name: Joi.string().required(),
                    location: Joi.object({
                        address: Joi.string().required()
                    }).required()
                }
            }
        }
    },
    {
        path: '/restaurants/{id}',
        method: 'PUT',
        config: {
            auth: {
                strategy: 'jwt',
                scope: 'owner'
            },
            handler: Restaurant.update,
            validate: {
                params: {
                    id: Joi.string().regex(/^[0-9a-fA-F]{24}$/)
                },
                payload: {
                    name: Joi.string(),
                    location: Joi.object({
                        address: Joi.string().required()
                    })
                }
            }
        }
    },
    {
        path: '/restaurants/{id}',
        method: 'DELETE',
        config: {
            auth: {
                strategy: 'jwt',
                scope: 'owner'
            },
            handler: Restaurant.remove,
            validate: {
                params: {
                    restaurant_id: Joi.string().regex(/^[0-9a-fA-F]{24}$/)
                }
            }
        }
    },
    {
        path: '/restaurants/{id}',
        method: 'GET',
        config: {
            auth: 'jwt',
            handler: Restaurant.getOne,
            validate: {
                params: {
                    id: Joi.string().regex(/^[0-9a-fA-F]{24}$/)
                }
            }
        }
    }
];