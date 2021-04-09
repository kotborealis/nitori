const logger = require(('../logging/logger')).logger('API');

const express = require('express');
const expressWs = require('express-ws');

const initApiMetrics = require('../loaders/api/metrics');
const initApiAuth = require('../loaders/api/auth');
const initApiError = require('../loaders/api/error');
const initApiExpress = require('../loaders/api/express');
const initApiRoutes = require('../loaders/api/routes');
const initApiSwagger = require('../loaders/api/swagger');
const initShutdown = require('../loaders/shutdown');
const {Sandbox} = require('../Sandbox');

module.exports = (config) => {
    const {port} = config.api;

    logger.info(`Initializing api on port ${port}`, config);

    const app = express();
    expressWs(app);

    app.ws('/ws/:id', (ws, req) => {
        const {id} = req.params;
        ws.addEventListener('message', ({data}) => Sandbox.registry.get(id)?.emit('stdin', data));

        const sender = message => ws.send(message);

        Sandbox.registry.await(id, () => {
            Sandbox.registry.get(id)?.on('stdout', sender);
            Sandbox.registry.get(id)?.on('stderr', sender);
        });
    });

    initApiMetrics({app, config});
    initApiSwagger({app, config});
    initApiExpress({app, config});
    initApiAuth({app, config});
    initApiRoutes({app, config});
    initApiError({app, config});

    initShutdown({config});

    app.listen(port, () => logger.info(`Server running on 0.0.0.0:${port}`));
};