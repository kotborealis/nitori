export const execOutputsToProgressStages = (execOutputs = []) =>
    execOutputs
        .map(({exitCode}) => {
            let variant = "";

            if(exitCode === 0)
                variant = "success";
            else if(exitCode === undefined)
                variant = "light";
            else
                variant = "danger";

            return {variant};
        })
        .map(({variant}, _, {length}) => ({
            size: 100 / length,
            variant
        }))
        .filter(identity => identity);