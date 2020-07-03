const {
    getCorrelationId,
    runWithCorrelation,
    NO_CORRELATION_ID
} = require('../../correlation/correlation');

const {
    correlationMiddleware,
    X_CORRELATION_ID
} = require('./correlationMiddleware');

describe('correlation middleware', () => {
    it('is a function', () =>
        expect(correlationMiddleware).toBeInstanceOf(Function)
    );

    it('returns a function w/ 3 args (req, res, next)', () => {
        expect(correlationMiddleware()).toBeInstanceOf(Function);
        expect(correlationMiddleware().length).toEqual(3);
    });

    it('calls next with correlation id', (done) => {
        const next = () => {
            expect(getCorrelationId()).toBeTruthy();
            done();
        };
        const req = {get: () => undefined};
        correlationMiddleware()(req, {}, next);
    });

    it('calls next with correlation id', (done) => {
        const next = () => {
            expect(getCorrelationId()).toBeTruthy();
            done();
        };
        const req = {get: () => undefined};
        correlationMiddleware()(req, {}, next);
    });

    it('uses id from headers', (done) => {
        const ID = '123qwe';

        const next = () => {
            expect(getCorrelationId()).toEqual(ID);
            done();
        };

        const req = {
            get: (header) => ({
                [X_CORRELATION_ID]: ID
            })[header]
        };

        correlationMiddleware()(req, {}, next);
    });
});