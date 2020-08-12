const {AsyncLocalStorage} = require('async_hooks');
const {default: ShortUniqueId} = require('short-unique-id');

const uid = new ShortUniqueId;
const asyncLocalStorage = new AsyncLocalStorage();

/**
 * Run function with correlation id
 * @param fn Function to run
 * @param id Correlation ID. Random UUID by default
 */
const runWithCorrelation =
    (fn, id = uid.randomUUID()) =>
        asyncLocalStorage.run(id, fn);

/**
 * missing correlation id constant
 * @type {string}
 */
const NO_CORRELATION_ID = `no-correlation-id`;

/**
 * Get current correlation id
 * Returns `no-correlation-id` if not set
 * @returns {any}
 */
const getCorrelationId =
    () =>
        asyncLocalStorage.getStore()
        || NO_CORRELATION_ID;

module.exports = {
    NO_CORRELATION_ID,
    runWithCorrelation,
    getCorrelationId
};