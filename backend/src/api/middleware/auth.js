const debug = require('debug')('nitori:auth');
const {auth} = require('../../auth');

/**
 * Middleware for auth with access control
 * If successful, adds `userData` property to req
 * @param url
 * @returns {Function}
 */
const authMiddleware = (url) => async (req, res, next) => {
    if(!req.userData){
        req.userData = await auth(url)(req.cookies.PHPSESSID);
    }

    if(!req.userData){
        const err = new Error("Not authorized");
        err.status = 403;
        throw err;
    }

    req.auth = (when = []) => {
        if(!when.map(w => w(req.userData)).every(_ => _)){
            const err = new Error("Not authorized by access control policy");
            err.status = 403;
            throw err;
        }
    };

    next();
};

module.exports = {authMiddleware};