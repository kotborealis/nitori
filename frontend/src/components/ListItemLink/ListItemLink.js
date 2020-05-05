import ListItem from '@material-ui/core/ListItem';
import {Link} from 'react-router-dom';
import React from 'react';

export const ListItemLink = (props = {}) =>
    <ListItem
        selected={props.selected}
        button
        component={Link}
        {...props}
        style={{
            textDecoration: 'none',
            ...(props.style || {}),
        }}
    />;