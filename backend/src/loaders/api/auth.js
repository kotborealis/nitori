const {authMiddleware} = require('../../api/middleware/auth');

/**
 * Auth middleware loader
 * @param app
 * @param config
 */
module.exports = ({app, config}) =>
    app.use(authMiddleware(config.auth.url));