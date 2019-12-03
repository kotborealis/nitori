import React from 'react';
import {ListGroup} from 'react-bootstrap';

export const WidgetsList = ({widgets = []}) =>
    <ListGroup>
        {widgets.map(({_id, name}) =>
            <ListGroup.Item action href={`/widgets/${_id}/`}>
                {name}
            </ListGroup.Item>
        )}
    </ListGroup>;