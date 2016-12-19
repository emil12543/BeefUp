const Joi = require('joi');

const envVarsSchema = Joi.object({
    PORT: Joi.number()
        .default(3000),
    SECRET: Joi.string()
        .default('123'),
    DB: Joi.string()
        .default('mongodb://localhost:27017/restaurant')
}).unknown()
  .required()
  
const { error, value: envVars } = Joi.validate(process.env, envVarsSchema);
if (error)
    throw new Error(`Config validation error: ${error.message}`);
    
const conf = {
    db: envVars.DB,
    secret: envVars.SECRET,
    port: envVars.PORT,
    alg: 'HS256'
};

module.exports = conf;