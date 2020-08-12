const {createProxyMiddleware} = require('http-proxy-middleware');
const authMock = require('../../backend/test/mock/auth/mock-auth-handler');

module.exports = (app) => {
    // backend API proxy
    app.use('/api/v1', createProxyMiddleware({
        target: 'http://127.0.0.1:3000',
        context: ['/api/v1'],
        pathRewrite: {'^/api/v1': ''},
        headers: {
            Cookie: 'PHPSESSID=examplePhpSessidCookie'
        }
    }));

    app.use('/api/metrics', createProxyMiddleware({
        target: 'http://127.0.0.1:9091/metrics',
        context: ['/api/metrics'],
        pathRewrite: {'^/api/metrics': ''}
    }));

    authMock(app);
};