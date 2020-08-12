const {
    getCorrelationId,
    runWithCorrelation,
    NO_CORRELATION_ID
} = require('../../../src/correlation/correlation');

describe('correlation', () => {
    it('returns NO_CORRELATION_ID out of context', () => {
        expect(getCorrelationId()).toEqual(NO_CORRELATION_ID);
    });

    it('returns id when ran with correlation', (done) => {
        runWithCorrelation(() => {
            expect(getCorrelationId()).toBeTruthy();
            done();
        });
    });

    it('returns set id when ran with correlation with id', (done) => {
        const ID = `correlation-test`;
        runWithCorrelation(() => {
            expect(getCorrelationId()).toEqual(ID);
            done();
        }, ID);
    });

    it('works in nested calls', (done) => {
        runWithCorrelation(() =>
            setImmediate(() =>
                setInterval(() => {
                    expect(getCorrelationId()).toBeTruthy();
                    done();
                }, 100))
        );
    });
});