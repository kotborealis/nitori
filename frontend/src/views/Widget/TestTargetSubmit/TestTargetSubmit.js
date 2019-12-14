import React, {useEffect} from 'react';
import {TestTargetInputForm} from '../../../components/TestTarget/TestTargetInputForm';
import {useApiStore, useStore} from '../../../store/store';
import {TestTarget} from '../../../components/TestTarget/TestTarget';
import {Loading} from '../../../components/InvalidState/Loading';
import {Error} from '../../../components/InvalidState/Error';
import Grid from '@material-ui/core/Grid';

export const TestTargetSubmit = () => {
    const widgetId = useStore(state => state.widgetId);

    const testSpecs = useApiStore("testSpecs");
    useEffect(() => void testSpecs.fetch(), [widgetId]);

    const testTargetSubmit = useApiStore("testTargetSubmit");

    const testSpecId = testTargetSubmit.data && testTargetSubmit.testSpecId;
    const testSpec = useApiStore("testSpec@testTargetSubmit");
    useEffect(() => void (testSpecId && testSpec.fetch({testSpecId})), [testSpecId]);

    const onSubmit = event => {
        event.preventDefault();

        const formData = new FormData(event.target);
        testTargetSubmit.fetch({formData});
    };

    let result = null;

    if(testTargetSubmit.init)
        result = null;
    else if(testTargetSubmit.loading)
        result = <Loading/>;
    else if(testTargetSubmit.error)
        result = <Error error={error}/>;
    else if(!testTargetSubmit.init)
        result = <TestTarget output={testTargetSubmit.data} testSpec={testSpec.data}/>;

    return (
        <Grid container>
            <Grid item xs={12}>
                {testSpecs.loading && <Loading/>}
                {testSpecs.error && <Error error={testSpecs.error}/>}
                {!testSpecs.loading && !testSpecs.error && !testSpecs.init &&
                 <TestTargetInputForm
                     {...{onSubmit, testSpecs: testSpecs.data}}
                     disabled={(testTargetSubmit.loading && !testTargetSubmit.init) || testSpecs.loading}
                 />
                }
            </Grid>
            <Grid item xs={12}>
                {result}
            </Grid>
        </Grid>
    );
};