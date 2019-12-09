import React, {useEffect} from 'react';
import {TestSpecsList} from '../../../components/TestSpec/TestSpecsList';
import {TestSpecCreate} from '../../../components/TestSpec/TestSpecCreate';
import {TestTargetsList} from '../../../components/TestTarget/TestTargetsList';
import {useStore} from '../../../store/store';
import {useParams} from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import {Typography} from '@material-ui/core';

export default () => {
    const {widgetId} = useParams();
    // Fetch test targets
    const fetchTestTargets = useStore(({testTargets: {fetch}}) => fetch);
    useEffect(() => void fetchTestTargets([widgetId]), [widgetId]);

    const [
        testSpecsData,
        testSpecsLoading,
        testSpecsError
    ] = useStore(({testSpecs: {data, loading, error}}) => [data, loading, error]);

    const [
        testTargetsData,
        testTargetsLoading,
        testTargetsError
    ] = useStore(({testTargets: {data, loading, error}}) => [data, loading, error]);

    return (
        <Grid container direction="column" spacing={10}>
            <Grid item>
                <Typography variant="h5">Добавить тест</Typography>
                <TestSpecCreate/>
            </Grid>
            <Grid item>
                <Typography variant="h5">Список тестов</Typography>
                <TestSpecsList
                    data={testSpecsData}
                    loading={testSpecsLoading}
                    error={testSpecsError}
                />
            </Grid>
            <Grid item>
                <Typography variant="h5">Список таргетов</Typography>
                <TestTargetsList
                    data={testTargetsData}
                    loading={testTargetsLoading || testSpecsLoading}
                    error={testTargetsError || testSpecsLoading}
                    testSpecs={testSpecsData}
                />
            </Grid>
        </Grid>
    );
};