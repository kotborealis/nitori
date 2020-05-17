export const testOutputsToFailedIndex = (testOutputs = []) => {
    const index = testOutputs
        .map(result => result ? result.exitCode === 0 : true)
        .indexOf(false);

    if(index === -1)
        return testOutputs.length - 1;

    return index;
};