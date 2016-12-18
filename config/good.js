const options = {
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
                {
                    compress: true,
                    size: '10MB',
                    path: './logs'
                }
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
                {
                    compress: true,
                    size: '10MB',
                    path: './logs'
                }
            ]
        }]
    }
};

module.exports = options;