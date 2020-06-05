const debug = require('debug')('nitori:auth');
const {auth} = require('../../auth/auth');

/**
 * Middleware for auth with access control
 * If successful, adds `userData` property to req
 * @param url
 * @returns {Function}
 */
const authMiddleware = (url) => async (req, res, next) => {
    if(!req.userData){
        req.userData = await auth(url)(req.cookies.PHPSESSID);
        // TODO убери костыль
        if(req.userData && req.userData.login === "prep"){
            req.userData.isAdmin = true;
        }
        if(req.userData && req.userData.login === "kotbarealis"){
            req.userData.isAdmin = true;
        }
        if(req.userData && req.userData.login === "vel"){
            req.userData.isAdmin = true;
        }
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