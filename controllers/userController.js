const Joi = require('joi');
const Boom = require('boom');
const User = require('mongoose').model('User');

exports.getAll = {
    handler: (request, reply) => {
        User.find({}, (err, users) => {
            if (err)
                return reply(Boom.badImplementation(err));

            return reply(users);
        });
    }
};

exports.getOne = {
    handler: function(request, reply) {
        User.findById(request.params.id, (err, user) => {
            if (err)
                return reply(Boom.badImplementation(err));

            return reply(user);
        });
    }
};

exports.create = {
    validate: {
        payload: {
            name: Joi.string().required(),
            age: Joi.number().required()
        }
    },
    handler: function(request, reply) {
        User.create(request.payload, (err, user) => {
            if (err)
                return reply(Boom.badImplementation(err));

            return reply(user);
        });
    }
};

exports.remove = {
    handler: function(request, reply) {
        User.findByIdAndRemove(request.params.id, err => {
            if (err)
                return reply(Boom.badImplementation(err));

            return reply({
                message: "User deleted successfully"
            });
        });
    }
};