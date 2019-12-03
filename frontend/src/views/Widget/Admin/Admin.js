import React, {useEffect} from 'react';
import {TestSpecsList} from '../../../components/TestSpec/TestSpecsList';
import {TestSpecCreate} from '../../../components/TestSpec/TestSpecCreate';
import {TestTargetsList} from '../../../components/TestTarget/TestTargetsList';
import {useStore} from '../../../store/store';
import {useParams} from 'react-router-dom';
import Grid from '@material-ui/core/Grid';

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
        <Grid container>
            <Grid item xs={12}>
                <h2>Добавить тест</h2>
                <TestSpecCreate/>
            </Grid>
            <Grid item xs={12}>
                <h2>Список тестов</h2>
                <TestSpecsList
                    data={testSpecsData}
                    loading={testSpecsLoading}
                    error={testSpecsError}
                />
            </Grid>
            <Grid item xs={12}>
                <h2>Список таргетов</h2>
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