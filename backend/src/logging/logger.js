const {getCorrelationId} = require('../correlation/correlation');
const {createLogger, format, transports} = require('winston');
const {combine, timestamp, label, json, errors, simple, colorize} = format;

//noinspection JSValidateJSDoc
/**
 *
 * @param {string} serviceName
 * @returns {winston.Logger}
 */
const logger = (serviceName) =>
    createLogger({
        level: 'debug',
        defaultMeta: {serviceName},
        format: combine(
            format((info) => {
                info.label = `${serviceName}/${getCorrelationId()}`;
                return info;
            })(),
            timestamp({
                format: `YYYY-MM-DD HH:mm:ss'`
            }),
            errors({stack: true}),
            colorize(),
            simple(),
        ),
        transports: [
            new transports.Console()
        ],
    });

module.exports = logger;