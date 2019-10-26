const debug = require('debug')('nitori:sse');

/**
 *
 * @param retry Retry interval for client reconnection
 * @param keepAlive Keep alive interval
 * @returns {Function}
 */
const sse_handler = (retry = 2000, keepAlive = 1000) => function(req, res, next){
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no'
    });

    res.sse = (event, data) => {
        if(event !== undefined && data !== undefined){
            debug('sse', event, data);
            try{
                res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
            }
            catch(e){
                debug("res.sse error:", e);
            }
        }
        else if(event !== undefined){
            debug('sse', event);
            res.write(`${event}\n\n`);
        }
        else throw new TypeError("Invalid arguments");
        return res;
    };

    res.sse(`retry ${retry}`);

    const keepAliveInterval = setInterval(() => {
        res.sse(':keepAlive');
    }, keepAlive);

    res.sseEnd = () => {
        clearInterval(keepAliveInterval);
        res.end();
    };

    res.on('close', res.sseEnd);
    res.on('error', res.sseEnd);

    next();
};

module.exports = sse_handler;