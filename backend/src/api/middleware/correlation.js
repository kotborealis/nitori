const {runWithCorrelation} = require('../../correlation/correlation');

/**
 * Correlation ID middleware
 *
 * Adds correlation id to all requests
 * Uses value from `x-correlation-id` from header, if present
 * @returns {function(*, *, *=): void}
 */
module.exports.correlationMiddleware =
    () =>
        (req, res, next) =>
            runWithCorrelation(next, req.get('x-correlation-id'));