const {getCorrelationId} = require('../correlation/correlation');
const {createLogger, format, transports} = require('winston');
const {combine, timestamp, label, json, errors, simple, colorize} = format;
const LokiTransport = require('winston-loki');

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
        format: combine(
            format((info) => {
                const correlationId = getCorrelationId();
                info.labels = {correlationId};
                return info;
            })(),
            timestamp({
                format: `YYYY-MM-DDTHH:mm:ss.SSSSSSSSSZ`
            }),
            errors({stack: true}),
            json(),
        ),
        transports: [
            new LokiTransport({
                ...config.logging.loki,
                json: true,
                labels: {app: 'testcpp', service}
            })
        ],
    });

module.exports = {logger, init};