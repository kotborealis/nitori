import React from 'react';
import {TestTargetInputForm} from '../../../components/TestTarget/TestTargetInputForm';
import {useStore} from '../../../store/store';
import {useParams} from 'react-router-dom';
import {TestTarget} from '../../../components/TestTarget/TestTarget';
import {Loading} from '../../../components/InvalidState/Loading';
import {Error} from '../../../components/InvalidState/Error';
import Grid from '@material-ui/core/Grid';
import {makeStyles, Typography} from '@material-ui/core';
import {red} from '@material-ui/core/colors';
import Paper from '@material-ui/core/Paper';
import Link from '@material-ui/core/Link';

const useStyles = makeStyles(theme => ({
    auth_needed: {
        padding: theme.spacing(3, 2),
        backgroundColor: red[100]
    }
}));

export const TestTargetSubmit = () => {
    const classes = useStyles();

    const {widgetId} = useParams();

    const [userDataLoading, userDataError] = useStore(({userData: {loading, error}}) => [loading, error]);

    const [tasksList, taskListLoading] = useStore(({testSpecs: {data, loading}}) => [data, loading]);

    const postTestTarget = useStore(({testTargetSubmit: {fetch}}) => fetch);

    const [
        testTarget,
        testTargetLoading,
        testTargetError
    ] = useStore(({testTargetSubmit: {data, loading, error}}) => [data, loading, error]);

    const testSpecId = testTarget && testTarget.testSpecId;
    const testSpecLoading = useStore(({testSpecs: {loading}}) => loading);
    const testSpecError = useStore(({testSpecs: {error}}) => error);
    const testSpec = useStore(({testSpecs: {data}}) => data.find(({_id}) => _id === testSpecId));

    const error = testTargetError || testSpecError;
    const loading = testTargetLoading;

    const onSubmit = event => {
        event.preventDefault();

        const formData = new FormData(event.target);
        const testSpecId = formData.get('testSpecId');

        postTestTarget([widgetId, testSpecId], {body: formData});
    };

    let result = null;


    if(loading === true)
        result = <Loading/>;
    else if(error)
        result = <Error error={error}/>;
    else if(testTarget === null)
        result = null;
    else
        result = <TestTarget output={testTarget} testSpec={testSpec}/>;

    return (
        <Grid container>
            {(!userDataLoading && userDataError) && (
                <Grid item xs={12}>
                    <Paper className={classes.auth_needed}>
                        <Typography variant="h5" component="h3">
                            Требуется аутентификация
                        </Typography>
                        <Typography>
                            <Link
                                href={process.env.AUTH_PATH}
                                target="_blank"
                                rel="noopener"
                                color="primary"
                            >
                                Аутентификация
                            </Link>
                        </Typography>
                    </Paper>
                </Grid>
            )}
            <Grid item xs={12}>
                <TestTargetInputForm {...{onSubmit, tasksList}} disabled={loading || taskListLoading}/>
            </Grid>
            <Grid item xs={12}>
                {result}
            </Grid>
        </Grid>
    );
};