const env = process.env.NODE_ENV || 'development';
const conf = {
    development: {
        db: 'mongodb://localhost:27017/restaurant',
        secret: '123'
    },
    production: {
        db: process.env.DB,
        secret: process.env.SECRET
    }
};


module.exports = conf[env];