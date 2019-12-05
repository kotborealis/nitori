import React from 'react';
import {Error} from '../InvalidState/Error';
import {Loading} from '../InvalidState/Loading';
import {formatDistance} from 'date-fns';
import {ru} from 'date-fns/locale';
import {Link, useParams} from 'react-router-dom';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

export const TestSpecsList = ({data, loading, error}) => {
    const {widgetId} = useParams();

    if(loading) return <Loading/>;
    if(error) return <Error error={error}/>;

    return (
        <Paper>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>Название</TableCell>
                        <TableCell>Описание</TableCell>
                        <TableCell>Обновлено</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.map(({_id, name, description, timestamp}) =>
                        <TableRow component={Link} to={`/widgets/${widgetId}/test-specs/${_id}`}>
                            <TableCell>{_id}</TableCell>
                            <TableCell>{name}</TableCell>
                            <TableCell>{description}</TableCell>
                            <TableCell>{formatDistance(new Date(timestamp), new Date, {locale: ru})} назад</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </Paper>
    );
};