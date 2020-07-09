require('winston-syslog');
const {getCorrelationId} = require('../correlation/correlation');
const {createLogger, format, transports} = require('winston');
const {combine, timestamp, json, errors} = format;
const {Syslog, Console} = transports;
const {levels: SyslogLevels} = require('winston').config.syslog;

let config;
const init = (config_) => config = config_;

//noinspection JSValidateJSDoc
/**
 *
 * @param {string} service
 * @returns {winston.Logger}
 */
const logger = (service) =>
    createLogger({
        level: 'debug',
        levels: SyslogLevels,
        format: combine(
            format((info) => {
                info.correlationId = getCorrelationId();
                return info;
            })(),
            timestamp({
                format: `YYYY-MM-DDTHH:mm:ss.SSSSSSSSSZ`
            }),
            errors({stack: true}),
            json(),
        ),
        transports: [
            new Syslog({
                ...config.logging.syslog
            }),
            new Console()
        ],
    });

module.exports = {logger, init};