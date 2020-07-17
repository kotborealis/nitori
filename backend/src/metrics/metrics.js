const promClient = require('prom-client');
const register = new promClient.Registry();
promClient.collectDefaultMetrics({register});

module.exports = {
    metricsRegister: register
};