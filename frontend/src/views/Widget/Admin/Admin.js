import React, {useEffect} from 'react';
import {TestSpecsList} from '../../../components/TestSpec/TestSpecsList';
import {TestSpecCreate} from '../../../components/TestSpec/TestSpecCreate';
import {TestTargetsList} from '../../../components/TestTarget/TestTargetsList';
import {useStore} from '../../../store/store';
import {useParams} from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import {Typography} from '@material-ui/core';
import {Loading} from '../../../components/InvalidState/Loading';
import {Error} from '../../../components/InvalidState/Error';

export default () => {
    const {widgetId} = useParams();

    // Fetch test targets
    const fetchTestTargets = useStore(state => state.testTargets.fetch);
    useEffect(() => void setTimeout(fetchTestTargets, 0), [widgetId]);

    const [
        testSpecsData,
        testSpecsLoading,
        testSpecsError,
        testSpecsReady,
    ] = useStore(({testSpecs: {data, loading, error, ready}}) => [data, loading, error, ready]);

    const [
        testTargetsData,
        testTargetsLoading,
        testTargetsError,
        testTargetsReady
    ] = useStore(({testTargets: {data, loading, error, ready}}) => [data, loading, error, ready]);

    return (
        <Grid container direction="column" spacing={10}>
            <Grid item>
                <Typography variant="h5">Добавить тест</Typography>
                <TestSpecCreate/>
            </Grid>
            <Grid item>
                <Typography variant="h5">Список тестов</Typography>
                {testSpecsLoading && <Loading/>}
                {testSpecsError && <Error error={testSpecsError}/>}
                {testSpecsReady && <TestSpecsList
                    data={testSpecsData}
                />}
            </Grid>
            <Grid item>
                <Typography variant="h5">Список таргетов</Typography>
                {testTargetsLoading || testSpecsLoading && <Loading/>}
                {testTargetsError || testSpecsError && <Error error={testTargetsError}/>}
                {testTargetsReady && testSpecsReady && <TestTargetsList
                    data={testTargetsData}
                    testSpecs={testSpecsData}
                />}
            </Grid>
        </Grid>
    );
};