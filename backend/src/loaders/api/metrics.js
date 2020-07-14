const promBundle = require('express-prom-bundle');

module.exports = ({app, config}) =>
    app.use(promBundle({
        includePath: true,
        includeMethod: true,
        autoregister: true,
        promClient: {
            collectDefaultMetrics: {}
        },
    }));