const Joi = require('joi');

const envVarsSchema = Joi.object({
    PORT: Joi.number()
        .default(3000),
    SECRET: Joi.string()
        .default('123'),
    DB: Joi.string()
        .default('mongodb://localhost:27017/restaurant')
}).unknown()
  .required();
  
const { err, value: envVars } = Joi.validate(process.env, envVarsSchema);
if (err)
    throw new Error(`Config validation error: ${err.message}`);
    
const conf = {
    db: {
        uri: envVars.DB
    },
    secret: envVars.SECRET,
    server: {
        port: envVars.PORT
    },
    jwt: {
        alg: 'HS256'
    },
    encryption: {
        alg: 'sha256'
    }
};

module.exports = conf;