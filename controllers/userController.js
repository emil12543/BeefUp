const Joi = require('joi');
const Boom = require('boom');
const User = require('mongoose').model('User');
const auth = require('../config/auth');
const redis = require('../config/redis');

exports.getAll = {
    auth: 'jwt',
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

exports.login = {
    auth: false,
    handler: function(request, reply) {
        auth.sign(request.params.id, (err, token) => {
            if (err)
                return reply(Boom.badImplementation(err));

            redis.addItem(token, request.params.id);
            return reply({token: token});
        });
    }
};

exports.revokeToken = {
    auth: 'jwt',
    handler: function(request, reply) {
        auth.verify(request.payload.token, (err, token) => {

            if (err)
                switch (err.message) {
                    case 'jwt malformed':
                        return reply(Boom.badRequest('Invalid token'));
                    default:
                        return reply(Boom.badImplementation(err));
                }

            if (token.id === request.auth.credentials.id) {
                redis.deleteItem(request.payload.token);
                return reply({
                    message: 'Success!'
                });
            } else
                return reply(Boom.unauthorized('You are not authorized to revoke this token!'));
        });
    }
};