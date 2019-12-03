import React from 'react';
import List from '@material-ui/core/List';
import Paper from '@material-ui/core/Paper';
import {ListItemLink} from '../ListItemLink/ListItemLink';

export const WidgetsList = ({widgets = []}) =>
    <Paper>
        <List>
            {widgets.map(({_id, name}) =>
                <ListItemLink to={`/widgets/${_id}/`}>
                    {name}
                </ListItemLink>
            )}
        </List>
    </Paper>;