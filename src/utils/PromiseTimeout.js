const PromiseTimeout = (promise, timeout) => Promise.race([
    promise,
    new Promise((resolve, reject) => {
        const id = setTimeout(() => {
            clearTimeout(id);
            reject(new Error(`Timed out in ${timeout}ms.`));
        }, timeout);
    })
]);

module.exports = {PromiseTimeout};