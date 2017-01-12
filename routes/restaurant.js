const Joi = require('joi');
const Restaurant = require('../handlers/restaurant').Restaurant;
const MealCategory = require('../handlers/restaurant').MealCategory;
const Item = require('../handlers/restaurant').Item;

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
    },
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
    },
    {
        path: '/items',
        method: 'POST',
        config: {
            auth: {
                strategy: 'jwt',
                scope: 'owner'
            },
            handler: Item.create,
            validate: {
                params: {
                    id: Joi.string().regex(/^[0-9a-fA-F]{24}$/)
                },
                payload: {
                    name: Joi.string().required(),
                    time: Joi.number().min(0).required(),
                    ingredients: Joi.array().sparse(false).items(Joi.string()).required(),
                    liquid: Joi.boolean()
                        .truthy('true')
                        .falsy('false'),
                    mealcategory_id: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
                    weight: Joi.number().min(1).required(),
                    price: Joi.number().min(0.01).required(),
                    restaurant_id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
                }
            }
        }
    },
    {
        path: '/items/{id}',
        method: 'GET',
        config: {
            auth: 'jwt',
            handler: Item.getOne,
            validate: {
                params: {
                    id: Joi.string().regex(/^[0-9a-fA-F]{24}$/)
                }
            }
        }
    },
    {
        path: '/items/{id}',
        method: 'PUT',
        config: {
            auth: {
                strategy: 'jwt',
                scope: 'owner'
            },
            handler: Item.update,
            validate: {
                params: {
                    id: Joi.string().regex(/^[0-9a-fA-F]{24}$/)
                },
                payload: {
                    name: Joi.string(),
                    time: Joi.number().min(0),
                    ingredients: Joi.array().sparse(false).items(Joi.string()),
                    liquid: Joi.boolean()
                        .truthy('true')
                        .falsy('false'),
                    mealcategory_id: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
                    weight: Joi.number().min(1),
                    price: Joi.number().min(0.01)
                }
            }
        }
    },
    {
        path: '/items/{id}',
        method: 'DELETE',
        config: {
            auth: {
                strategy: 'jwt',
                scope: 'owner'
            },
            handler: Item.remove,
            validate: {
                params: {
                    id: Joi.string().regex(/^[0-9a-fA-F]{24}$/)
                }
            }
        }
    }
];