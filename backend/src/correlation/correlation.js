const {AsyncLocalStorage} = require('async_hooks');
const {default: ShortUniqueId} = require('short-unique-id');

const uid = new ShortUniqueId;
const asyncLocalStorage = new AsyncLocalStorage();

/**
 * Run function with correlation id
 * @param fn Function to run
 * @param id Correlation ID. Random UUID by default
 */
module.exports.runWithCorrelation =
    (fn, id = uid.randomUUID()) =>
        asyncLocalStorage.run(id, fn);

/**
 * Get current correlation id
 * Returns `no-correlation-id` if not set
 * @returns {any}
 */
module.exports.getCorrelationId =
    () =>
        asyncLocalStorage.getStore()
        || 'no-correlation-id';