import React from 'react';
import {Table} from 'react-bootstrap';
import {ErrorRenderer} from '../ErrorRenderer/ErrorRenderer';
import {LoadingRenderer} from '../LoadingRenderer/LoadingRenderer';
import {apiUrl} from '../../api';
import {formatDistance} from 'date-fns';
import {ru} from 'date-fns/locale';
import {useStore} from '../../store/store';

export const TestSpecsList = ({data, loading, error}) => {
    const widgetId = useStore(({widgetId}) => widgetId);

    if(loading) return <LoadingRenderer/>;
    if(error) return <ErrorRenderer error={error}/>;

    return (
        <>
            <Table stripped bordered hover>
                <thead>
                <tr>
                    <th>#</th>
                    <th>Название</th>
                    <th>Обновлено</th>
                    <th>Исходный код</th>
                </tr>
                </thead>
                <tbody>
                {data.map(({_id, name, description, timestamp}) => <tr>
                    <td>{_id}</td>
                    <td>{name}</td>
                    <td>{formatDistance(new Date(timestamp), new Date, {locale: ru})}</td>
                    <td>
                        <a href={apiUrl(`/widgets/${widgetId}/test-specs/${_id}/source`)} target="_blank">
                            {name}.cpp
                        </a>
                    </td>
                </tr>)}
                </tbody>
            </Table>
        </>
    );
};