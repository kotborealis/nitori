export const testOutputsToFailedIndex = (testOutputs = []) => {
    const index = testOutputs
        .map(({exitCode}) => exitCode === 0)
        .indexOf(false);

    if(index === -1)
        return testOutputs.length - 1;

    return index;
};