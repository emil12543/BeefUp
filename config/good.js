const config = require('./config');
const options = config => {
    let c = {
        compress: config.good.compress,
        size: config.good.size,
        path: config.good.path
    };

    if (!c.compress)
        delete c.compress;
    else if (config.good.type)
        c.compress = config.good.type;

    return c;
};

module.exports = {
    ops: {
        interval: 5000
    },
    reporters: {
        consoleReporter: [{
            module: 'good-squeeze',
            name: 'Squeeze',
            args: [{ log: '*', response: '*' }]
        }, {
            module: 'good-console'
        }, 'stdout'],
        opsReporter: [{
            module: 'good-squeeze',
            name: 'Squeeze',
            args: [{ ops: '*' }]
        }, {
            module: 'good-squeeze',
            name: 'SafeJson',
            args: [
                null,
                { separator: ',' }
            ]
        }, {
            module: 'rotating-file-stream',
            args: [
                'ops.log',
                options(config)
            ]
        }],
        errorReporter: [{
            module: 'good-squeeze',
            name: 'Squeeze',
            args: [{ error: '*' }]
        }, {
            module: 'good-squeeze',
            name: 'SafeJson',
            args: [
                null,
                { separator: ',' }
            ]
        }, {
            module: 'rotating-file-stream',
            args: [
                'err.log',
                options(config)
            ]
        }]
    }
};