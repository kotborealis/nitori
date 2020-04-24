import React, {useEffect} from 'react';
import {TestTargetInputForm} from '../../../components/TestTarget/TestTargetInputForm';
import {TestTarget} from '../../../components/TestTarget/TestTarget';
import {Loading} from '../../../components/InvalidState/Loading';
import {Error} from '../../../components/InvalidState/Error';
import Grid from '@material-ui/core/Grid';
import {apiActions} from '../../../api/apiActions';
import {useApi} from '../../../api/useApi';
import {useParams} from 'react-router-dom';

export const TestTargetSubmit = () => {
    const {widgetId} = useParams();

    const testSpecs = useApi(apiActions.testSpecs);
    testSpecs.useFetch({widgetId})([widgetId]);

    const testTargetSubmit = useApi(apiActions.testTargetSubmit);

    const testSpecId = testTargetSubmit.data && testTargetSubmit.testSpecId;
    const testSpec = useApi(apiActions.testSpec);
    useEffect(() => void (testSpecId && testSpec.fetch({widgetId, testSpecId})), [widgetId, testSpecId]);

    const onSubmit = event => {
        event.preventDefault();

        const formData = new FormData(event.target);
        testTargetSubmit.fetch({widgetId, formData});
    };

    let result = null;

    if(testTargetSubmit.init)
        result = null;
    else if(testTargetSubmit.loading)
        result = <Loading/>;
    else if(testTargetSubmit.error)
        result = <Error error={testTargetSubmit.error}/>;
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