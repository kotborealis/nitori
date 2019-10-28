const debug = require('debug')('nitori:sse');

class SSE {
    res;
    keepAliveInterval;

    constructor(res, retry = 2000, keepAlive = 1000) {
        this.res = res;

        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no'
        });

        this.keepAliveInterval = setInterval(() => this.emit(':keepAlive'), keepAlive);
        this.emit(`retry ${retry}`);

        res.on('close', this.end);
        res.on('error', this.end);


    }

    emit(event, data) {
        if(event !== undefined && data !== undefined){
            debug('sse', event, data);
            try{
                this.res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
            }
            catch(e){
                debug("res.sse error:", e);
            }
        }
        else if(event !== undefined){
            debug('sse', event);
            this.res.write(`${event}\n\n`);
        }
        else throw new TypeError("Invalid arguments");
        return this;
    }

    end() {
        clearInterval(this.keepAliveInterval);
        return this;
    }
}

/**
 *
 * @param retry Retry interval for client reconnection
 * @param keepAlive Keep alive interval
 * @returns {Function}
 */
const sse_req_handler = (retry = 2000, keepAlive = 1000) => function(req, res, next){
    res.sse = new SSE(res, retry, keepAlive);
    next();
};

const sse_err_handler = function (err, req, res, next) {
    if(res.sse){
        debug("Error handler: ", err.message);
        res.sse.emit('error', {
            error: {
                reason: err.reason,
                message: err.message,
                status: err.status
            }
        }).end();
    }
    else{
        next(err);
    }
};

module.exports = {
    SSE,
    sse_req_handler,
    sse_err_handler
};