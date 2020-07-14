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
        transports: generateTransports(config.logging.transports, config)
    });

/**
 * Map of names and supported transports
 * @type {{console: (function(): *), syslog: (function({logging?: *}): *)}}
 */
const transportMap = {
    console: () => new Console(),
    syslog: ({logging: syslog}) => console.log("creating syslog", syslog) || new Syslog(syslog)
};

/**
 * Generate transports from names and config
 * @param names
 * @param config
 * @returns {*[]}
 */
const generateTransports = (names, config) =>
    names
        .filter(name =>
            transportMap.hasOwnProperty(name)
            || console.warn(`Transport ${name} is not supported. Supported: ${Object.keys(transportMap)}`)
        )
        .map(name => transportMap[name](config));

module.exports = {logger, init};