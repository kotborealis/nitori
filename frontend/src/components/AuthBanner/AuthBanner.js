import React from 'react';
import {makeStyles, Typography} from '@material-ui/core';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import {red} from '@material-ui/core/colors';

const useStyles = makeStyles(theme => ({
    auth_needed: {
        padding: theme.spacing(3, 2),
        backgroundColor: red[100]
    }
}));

export const AuthBanner = ({show}) => {
    const classes = useStyles();

    if(!show) return null;

    return (
        <Paper className={classes.auth_needed}>
            <Typography variant="h5" component="h3">
                Требуется аутентификация
            </Typography>
            <Typography>
                Некоторые функции недоступны без <Link
                href={process.env.AUTH_PATH}
                target="_blank"
                rel="noopener"
                color="primary"
            >
                аутентификации
            </Link>.
            </Typography>
        </Paper>
    );
};
