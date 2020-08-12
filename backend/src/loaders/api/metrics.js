const swStats = require('swagger-stats');
const YAML = require('yamljs');
const swaggerSpec = YAML.load('./api.yaml');

const {metricsRegister} = require('../../metrics/metrics');

module.exports = ({app, config}) => {
    app.use(swStats.getMiddleware({swaggerSpec}));

    app.get('/metrics', (req, res) =>
        Promise
            .all([
                swStats.getPromStats(),
                metricsRegister.metrics()
            ])
            .then(metrics => res.send(metrics.join('\n\n')))
    );
};