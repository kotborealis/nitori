const {parse: parseUrl}= require('url');
const request = require('request-promise-native');

module.exports = ({url}) => async (phpsessid) => {
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