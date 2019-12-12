import React, {useEffect} from 'react';
import {TestTargetInputForm} from '../../../components/TestTarget/TestTargetInputForm';
import {useStore} from '../../../store/store';
import {TestTarget} from '../../../components/TestTarget/TestTarget';
import {Loading} from '../../../components/InvalidState/Loading';
import {Error} from '../../../components/InvalidState/Error';
import Grid from '@material-ui/core/Grid';

export const TestTargetSubmit = () => {
    const widgetId = useStore(state => state.widgetId);

    const [
        testSpecsFetch,
        testSpecs,
        testSpecsLoading,
        testSpecsInit,
        testSpecsError
    ] = useStore(({testSpecs: {fetch, data, loading, init, error}}) => [fetch, data, loading, init, error]);

    useEffect(() => void testSpecsFetch(), [widgetId]);

    const submitTestTarget = useStore(state => state.testTargetSubmit.fetch);

    const [
        testTarget,
        testTargetLoading,
        testTargetInit,
        testTargetError
    ] = useStore(({testTargetSubmit: {data, loading, init, error}}) => [data, loading, init, error]);

    const testSpecId = testTarget && testTarget.testSpecId;
    const testSpec = useStore(({testSpecs: {data}}) => data ? data.find(({_id}) => _id === testSpecId) : null);

    const onSubmit = event => {
        event.preventDefault();

        const formData = new FormData(event.target);
        void submitTestTarget({formData});
    };

    let result = null;

    if(testTargetInit)
        result = null;
    else if(testTargetLoading)
        result = <Loading/>;
    else if(testTargetError)
        result = <Error error={error}/>;
    else if(!testTargetInit)
        result = <TestTarget output={testTarget} testSpec={testSpec}/>;

    return (
        <Grid container>
            <Grid item xs={12}>
                {testSpecsLoading && <Loading/>}
                {testSpecsError && <Error error={testSpecsError}/>}
                {!testSpecsLoading && !testSpecsError && !testSpecsInit &&
                 <TestTargetInputForm
                     {...{onSubmit, testSpecs}}
                     disabled={(testTargetLoading && !testTargetInit) || testSpecsLoading}
                 />
                }
            </Grid>
            <Grid item xs={12}>
                {result}
            </Grid>
        </Grid>
    );
};