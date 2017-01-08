const Joi = require('joi');
const MealCategory = require('../handlers/mealCategory');

module.exports = [
    {
        path: '/restaurants/{restaurant_id}/meals',
        method: 'POST',
        config: {
            auth: {
                strategy: 'jwt',
                    scope: 'owner'
            },
            handler: MealCategory.create,
            validate: {
                params: {
                    restaurant_id: Joi.string().regex(/^[0-9a-fA-F]{24}$/)
                },
                payload: {
                    title: Joi.string().required()
                }
            }
        }
    },
    {
        path: '/restaurants/{restaurant_id}/meals/{id}',
        method: 'PUT',
        config: {
        auth: {
            strategy: 'jwt',
            scope: 'owner'
        },
        handler: MealCategory.update,
            validate: {
                params: {
                    restaurant_id: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
                    id: Joi.string().regex(/^[0-9a-fA-F]{24}$/)
                },
                payload: {
                    title: Joi.string().required()
                }
            }
        }
    },
    {
        path: '/restaurants/{restaurant_id}/meals',
        method: 'GET',
        config: {
            auth: {
                strategy: 'jwt',
                scope: 'owner'
            },
            handler: MealCategory.get,
            validate: {
                params: {
                    restaurant_id: Joi.string().regex(/^[0-9a-fA-F]{24}$/)
                }
            }
        }
    },
    {
        path: '/restaurants/{restaurant_id}/meals/{id}',
        method: 'DELETE',
        config: {
            auth: {
                strategy: 'jwt',
                scope: 'owner'
            },
            handler: MealCategory.remove,
            validate: {
                params: {
                    restaurant_id: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
                    id: Joi.string().regex(/^[0-9a-fA-F]{24}$/)
                }
            }
        }
    }
];