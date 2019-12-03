import React from 'react';
import Paper from '@material-ui/core/Paper';
import {makeStyles, Typography} from '@material-ui/core';
import ErrorIcon from '@material-ui/icons/Error';
import {red} from '@material-ui/core/colors';

const useStyles = makeStyles(theme => ({
    root: {
        padding: theme.spacing(3, 2),
        backgroundColor: red[100]
    }
}));

export const Error = ({error: {errors = [], message = ""}}) => {
    const {root} = useStyles();

    return (
        <Paper className={root}>
            <Typography variant="h5" component="h3">
                <ErrorIcon style={{color: red[900]}}/>
                Runtime error
            </Typography>
            <Typography component="p">
                {errors.map(error => <>{JSON.stringify(error)}</>)}
            </Typography>
        </Paper>
    );
};