const {auth} = require('../../auth/auth');

/**
 * Middleware for auth with access control
 * If successful, adds `userData` property to req
 * @param url
 * @param {[string]} admins
 * @returns {Function}
 */
const authMiddleware = (url, admins = []) => async (req, res, next) => {
    if(!req.userData){
        req.userData = await auth(url)(req.cookies.PHPSESSID);

        if(req.userData)
            req.userData.isAdmin =
                req.userData.isAdmin || admins.indexOf(req.userData.login) >= 0;
    }

    req.auth = (...when) => {
        if(!req.userData || !when.flat().every(w => w(req.userData))){
            const err = new Error("Not authorized by access control policy");
            err.status = 403;
            throw err;
        }
    };

    next();
};

module.exports = {authMiddleware};