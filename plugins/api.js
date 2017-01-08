exports.register = (server, options, next) => {
    if (options.strategy)
        server.auth.strategy(options.strategy.name, options.strategy.scheme, true, options.strategy.conf);
    server.route(options.routes);

    next();
};

exports.register.attributes = {
    name: 'api',
    version: '1.0.0'
};