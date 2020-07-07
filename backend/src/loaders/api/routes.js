const widgetsRoute = require('../../api/routes/widgets/widgets');
const specRunnerRoute = require('../../api/routes/specRunner/specRunner');

/**
 * Configure routes for express app
 * @param app
 * @param config
 */
module.exports = ({app, config}) => {
    app.use('/widgets/', widgetsRoute(config));
    app.use('/specRunner/', specRunnerRoute(config));
};