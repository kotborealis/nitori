import React from 'react';
import {ListGroup} from 'react-bootstrap';
import {Error} from '../InvalidState/Error';
import {Loading} from '../InvalidState/Loading';
import {formatDistance} from 'date-fns';
import {ru} from 'date-fns/locale';
import {useParams} from 'react-router-dom';

export const TestSpecsList = ({data, loading, error}) => {
    const {widgetId} = useParams();

    if(loading) return <Loading/>;
    if(error) return <Error error={error}/>;

    return (
        <ListGroup>
            {data.map(({_id, name, timestamp}) => <ListGroup.Item action
                                                                  href={`/widgets/${widgetId}/test-specs/${_id}`}>
                {name} ({formatDistance(new Date(timestamp), new Date, {locale: ru})})
            </ListGroup.Item>)}
        </ListGroup>
    );
};