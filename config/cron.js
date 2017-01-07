const cron = require('node-cron');
const auth = require('./auth');

cron.schedule('00 00 * * *', () => {
    auth.init();
    console.log('Removed invalid tokens');
});