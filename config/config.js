const Joi = require('joi');

const envVarsSchema = Joi.object({
    PORT: Joi.number()
        .default(3000),
    SECRET: Joi.string()
        .default('123'),
    DB: Joi.string()
        .default('mongodb://localhost:27017/beefup'),
    LOGS_PATH: Joi.string()
        .default('./logs'),
    LOGS_SIZE: Joi.string().regex(/^[1-9]+(B|K|M|G)$/g)
        .default('10M'),
    LOGS_COMPRESS: Joi.boolean()
        .truthy('TRUE')
        .truthy('true')
        .falsy('FALSE')
        .falsy('false')
        .default(false),
    LOGS_COMPRESS_FORMAT: Joi.string().valid('gzip'),
    JWT_EXP: Joi.string().regex(/^[0-9]+( days|d|h| hrs|m|s|y)?$/g)
        .default('1d'),
    MAPS_API_KEY: Joi.string()
}).unknown()
  .required();

const {error, value: envVars} = Joi.validate(process.env, envVarsSchema);
if (error)
    throw new Error(`Config validation error: ${error.message}`);

module.exports = {
    db: {
        uri: envVars.DB,
        config: {
            autoIndex: false
        }
    },
    secret: envVars.SECRET,
    server: {
        port: envVars.PORT
    },
    jwt: {
        alg: 'HS256',
        exp: envVars.JWT_EXP
    },
    encryption: {
        alg: 'sha256'
    },
    good: {
        type: envVars.LOGS_COMPRESS_FORMAT,
        compress: envVars.LOGS_COMPRESS,
        size: envVars.LOGS_SIZE,
        path: envVars.LOGS_PATH
    },
    maps: {
        provider: 'google',
        key: envVars.MAPS_API_KEY
    }
};