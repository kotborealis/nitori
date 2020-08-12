const express = require('express');
const authMockHandler = require('../../../mock/auth/mock-auth-handler');
const {authMiddleware} = require('../../../../src/api/middleware/auth');

describe('Auth api integration', () => {
    let app;
    let server;
    let port;
    let authState;
    let auth;

    beforeAll(async (done) => {
        app = express();
        authState = authMockHandler(app);
        server = app.listen(0, () => {
            port = server.address().port;
            done();
        });
        auth = () => new Promise((resolve, reject) => {
            const req = {
                cookies: {PHPSESSID: '123qwe'}
            };
            authMiddleware(`http://127.0.0.1:${port}/auth/user_data.php`)(req, {}, () => resolve(req));
        });
    });

    test('Authorized admin', async () => {
        authState.auth = true;
        authState.isAdmin = true;

        const req = await auth();
        expect(req.userData).toBeTruthy();
        expect(req.userData.isAdmin).toBe(true);
        expect(typeof req.auth).toEqual('function');
        expect(req.auth.bind(this, [({isAdmin}) => isAdmin === true])).not.toThrow();
    });

    test('Authorized user', async () => {
        authState.auth = true;
        authState.isAdmin = false;

        const req = await auth();
        expect(req.userData).toBeTruthy();
        expect(req.userData.isAdmin).toBe(false);
        expect(typeof req.auth).toEqual('function');
        expect(req.auth.bind(this, [({isAdmin}) => isAdmin === true])).toThrow();
    });

    test('Unauthorized', async () => {
        authState.auth = false;
        authState.isAdmin = false;

        const req = await auth();
        expect(req.userData).toBe(null);
        expect(typeof req.auth).toEqual('function');
        expect(req.auth.bind(this, [({isAdmin}) => isAdmin === true])).toThrow();
    });

    afterAll(() => server.close());
});