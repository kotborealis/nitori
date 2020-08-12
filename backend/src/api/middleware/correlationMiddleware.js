const {runWithCorrelation} = require('../../correlation/correlation');

/**
 * Correlation id header name constant
 * @type {string}
 */
const X_CORRELATION_ID = `x-correlation-id`;

/**
 * Correlation ID middleware
 *
 * Adds correlation id to all requests
 * Uses value from `x-correlation-id` from header, if present
 * @returns {function(*, *, *=): void}
 */
const correlationMiddleware =
    () =>
        (req, res, next) =>
            runWithCorrelation(next, req.get(X_CORRELATION_ID));

module.exports = {
    X_CORRELATION_ID,
    correlationMiddleware
};