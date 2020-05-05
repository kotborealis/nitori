import React from 'react';
import styles from './NotFound.css';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

export const NotFound = ({message = `No one's around to help`}) => {
    return (
        <Paper className={styles.root}>
            <Typography variant="h2" component="h3">
                404
            </Typography>
            <Typography component="h5">
                {message}
            </Typography>
        </Paper>
    );
};