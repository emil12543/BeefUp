const Boom = require('boom');

exports.handleError = (err, reply) => {
	if (err.name == 'ValidationError' && err.errors.username && err.errors.username.kind == 'unique')
            return reply('This username is already taken');
        else if (err.name == 'ValidationError' && err.errors.email && err.errors.email.kind == 'unique')
            return reply('There is already a user with this email');

        return reply(Boom.badImplementation(err));
};