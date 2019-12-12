import React, {useEffect} from 'react';
import {TestSpecsList} from '../../../components/TestSpec/TestSpecsList';
import {TestTargetsList} from '../../../components/TestTarget/TestTargetsList';
import {useStore} from '../../../store/store';
import Grid from '@material-ui/core/Grid';
import {Typography} from '@material-ui/core';
import {Loading} from '../../../components/InvalidState/Loading';
import {Error} from '../../../components/InvalidState/Error';

export default () => {
    const widgetId = useStore(state => state.widgetId);

    // Fetch test targets
    const fetchTestTargets = useStore(state => state.testTargets.fetch);
    useEffect(() => void setTimeout(fetchTestTargets, 0), [widgetId]);

    const [
        testSpecsData,
        testSpecsLoading,
        testSpecsError,
    ] = useStore(({testSpecs: {data, loading, error}}) => [data, loading, error]);

    const [
        testTargetsData,
        testTargetsLoading,
        testTargetsError
    ] = useStore(({testTargets: {data, loading, error}}) => [data, loading, error]);

    return (
        <Grid container direction="column" spacing={10}>
            <Grid item>
                <Typography variant="h5">Список тестов</Typography>
                {testSpecsLoading && <Loading/>}
                {testSpecsError && <Error error={testSpecsError}/>}
                {!testSpecsLoading && !testSpecsError && <TestSpecsList
                    data={testSpecsData}
                />}
            </Grid>
            <Grid item>
                <Typography variant="h5">Список таргетов</Typography>
                {testTargetsLoading && <Loading/>}
                {testTargetsError && <Error error={testTargetsError}/>}
                {!testTargetsLoading && !testTargetsError &&
                 <TestTargetsList
                     data={testTargetsData}
                 />}
            </Grid>
        </Grid>
    );
};