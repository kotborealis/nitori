import React, {useEffect} from 'react';
import {TestSpecsList} from '../../../components/TestSpec/TestSpecsList';
import {TestTargetsList} from '../../../components/TestTarget/TestTargetsList';
import {useApiStore, useStore} from '../../../store/store';
import Grid from '@material-ui/core/Grid';
import {Typography} from '@material-ui/core';
import {Loading} from '../../../components/InvalidState/Loading';
import {Error} from '../../../components/InvalidState/Error';
import {useHistory} from "react-router-dom";

export default () => {
    const history = useHistory();
    const widgetId = useStore(state => state.widgetId);

    // Fetch test targets
    const testTargets = useApiStore("testTargets");
    useEffect(() => void testTargets.fetch(), [widgetId]);

    const testSpecDelete = useApiStore("testSpecDelete@admin");

    const testSpecs = useApiStore("testSpecs");

    useEffect(() => void testSpecs.fetch(), [testSpecDelete.data]);

    return (
        <Grid container direction="column" spacing={10}>
            <Grid item>
                <Typography variant="h5">Список тестов</Typography>
                {testSpecs.loading && <Loading/>}
                {testSpecs.error && <Error error={testSpecs.error}/>}
                {!testSpecs.loading && !testSpecs.error && <TestSpecsList
                    data={testSpecs.data}
                    onEdit={id => history.push(`/widgets/${widgetId}/test-specs-submit/${id}`)}
                    onDelete={id => testSpecDelete.fetch({testSpecId: id})}
                />}
            </Grid>
            <Grid item>
                <Typography variant="h5">Список таргетов</Typography>
                {testTargets.loading && <Loading/>}
                {testTargets.error && <Error error={testTargets.error}/>}
                {!testTargets.loading && !testTargets.error &&
                 <TestTargetsList
                     data={testTargets.data}
                 />}
            </Grid>
        </Grid>
    );
};