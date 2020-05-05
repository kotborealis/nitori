import React from 'react';
import List from '@material-ui/core/List';
import Paper from '@material-ui/core/Paper';
import {ListItemLink} from '../ListItemLink/ListItemLink';
import {Typography} from '@material-ui/core';
import Divider from '@material-ui/core/Divider';

export const WidgetsList = ({widgets = [], selected = null}) =>
    <Paper>
        <Typography variant="h5">Виджеты</Typography>
        <Divider/>
        <List>
            {widgets.map(({_id, name}) =>
                <ListItemLink to={`/dashboard/${_id}/`} selected={selected === _id}>
                    <Typography>
                        {name}
                    </Typography>
                </ListItemLink>
            )}
        </List>
    </Paper>;