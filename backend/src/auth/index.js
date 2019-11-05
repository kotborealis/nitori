const debug = require('debug')('nitori:auth');
const {parse: parseUrl} = require('url');
const request = require('request-promise-native');

/**
 * Auth using specified url
 * @param url
 * @returns {Function}
 */
const auth = (url) => async (phpsessid) => {
    if(!phpsessid)
        return null;

    const {protocol, host} = parseUrl(url);

    const jar = request.jar();
    jar.setCookie(
        `PHPSESSID=${phpsessid}`,
        `${protocol}//${host}/`
    );

    try{
        return await request({url, jar, json: true});
    }
    catch(e){
        if(e.statusCode === 400)
            return null;
        else
            throw e;
    }
};

/**
 * Middleware for auth with access control
 * If successful, adds `userData` property to req
 * @param url
 * @returns {Function}
 */
const middleware = (url) => (when = []) => async (req, res, next) => {
    if(!req.userData){
        try{
            req.userData = await auth(url)(req.cookies.PHPSESSID);
        }
        catch(e){
            debug("Auth middleware error:", e);
        }
    }

    if(!req.userData){
        const err = new Error("Not authorized");
        err.reason = "Not authorized";
        err.status = 403;
        next(err);
        return;
    }

    if(!when.map(w => w(req.userData)).every(_ => _)){
        const err = new Error("Not authorized by access control policy");
        err.reason = "Not authorized by access control policy";
        err.status = 403;
        next(err);
        return;
    }

    next();
};

module.exports = {
    auth,
    middleware
};