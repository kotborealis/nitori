const PromiseTimeout = (promise, timeout) => Promise.race([
    promise,
    timeout > 0 ? new Promise((resolve, reject) => {
        const id = setTimeout(() => {
            clearTimeout(id);
            reject(new Error(`Timed out in ${timeout}ms.`));
        }, timeout);
    }) : new Promise(() => 0)
]);

module.exports = {PromiseTimeout};