const Boom = require('boom');

/**
 * @param err
 * @param reply
 * @param response
 * @description Will handle the provided error. If there isn't error with send the user provided data.
 * @throws Unexpected error
 */
exports.handleResponse = (err, reply, response) => {
    if (!err) {
        let data = {};
        if (!response) // sets default response
            data = {
                message: 'Success'
            };
        else {
            if (response.fields) { // checks if only some fields should the responded
                if (response.type && response.type === 'exclude') { // checks if the provided fields should be excluded
                    data = response.data;
                    response.fields.map(field => {
                        delete data[field];
                    });
                } else
                    response.fields.map(field => {
                        data[field] = response.data[field];
                    });
            } else
                data = response.data;
        }

        return reply(data);
    }

    // handle errors
    if (err.name == 'ValidationError' && err.errors.username && err.errors.username.kind == 'unique')
        return reply({
            message: 'This username is already taken'
        });
    else if (err.name == 'ValidationError' && err.errors.email && err.errors.email.kind == 'unique')
        return reply({
            message: 'There is already a user with this email'
        });
    else if (err.message == 'Wrong password')
        return reply(Boom.unauthorized(err.message));
    else if (err.message == 'Wrong username')
        return reply(Boom.unauthorized('There is no user with this username'));
    else if (err.message == 'Not staff')
        return reply(Boom.unauthorized('You are not authorized to this user'));
    else if (err.message == 'Not user')
        return reply({
            message: 'There is no such user'
        });
    else if (err.message == 'Invalid address')
        return reply(Boom.badData(err.message));
    else if (err.message == 'No restaurant')
        return reply({
            message: 'There is no such restaurant'
        });
    else if (err.message == 'Not authorized to restaurant')
        return reply(Boom.unauthorized('You are not authorized to this restaurant'));
    else if (err.message == 'The tokens are the same')
        return reply(Boom.badData(err.message));
    else if (err.message == 'Not authorized to revoke token')
        return reply(Boom.unauthorized('You are not authorized to revoke this token'));
    else if (err.message == 'No mealcategory')
        return reply({
            message: 'There is no such meal category'
        });
    else if (err.message == 'Not authorized to mealcategory')
        return reply(Boom.unauthorized('You are not authorized to this mealcategory'));
    else if (err.message == 'No item')
        return reply({
            message: 'There is no such item'
        });

    return reply(Boom.badImplementation(err));
};