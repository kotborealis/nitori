import React from 'react';
import {ListGroup} from 'react-bootstrap';
import {ErrorRenderer} from '../ErrorRenderer/ErrorRenderer';
import {LoadingRenderer} from '../LoadingRenderer/LoadingRenderer';
import {formatDistance} from 'date-fns';
import {ru} from 'date-fns/locale';
import {useStore} from '../../store/store';

export const TestSpecsList = ({data, loading, error}) => {
    const widgetId = useStore(({widgetId}) => widgetId);

    if(loading) return <LoadingRenderer/>;
    if(error) return <ErrorRenderer error={error}/>;

    return (
        <ListGroup>
            {data.map(({_id, name, timestamp}) => <ListGroup.Item action
                                                                  href={`/widgets/${widgetId}/test-specs/${_id}`}>
                {name} ({formatDistance(new Date(timestamp), new Date, {locale: ru})})
            </ListGroup.Item>)}
        </ListGroup>
    );
};