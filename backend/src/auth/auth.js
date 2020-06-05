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

module.exports = {
    auth
};