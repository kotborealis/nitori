import React from 'react';
import {formatDistance} from 'date-fns';
import {ru} from 'date-fns/locale';
import {Link, useParams} from 'react-router-dom';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';

export const TestSpecsList = ({data, onDelete, onEdit}) => {
    const {widgetId} = useParams();

    return (
        <Paper>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>Название</TableCell>
                        <TableCell>Описание</TableCell>
                        <TableCell>Обновлено</TableCell>
                        <TableCell>Действие</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.map(({_id, name, description, timestamp}) =>
                        <TableRow
                            component={Link}
                            to={`/widgets/${widgetId}/test-specs/${_id}`}
                            style={{textDecoration: 'none'}}
                        >
                            <TableCell>{_id}</TableCell>
                            <TableCell>{name}</TableCell>
                            <TableCell>{description}</TableCell>
                            <TableCell>{formatDistance(new Date(timestamp), new Date, {locale: ru})} назад</TableCell>
                            <TableCell>
                                <Button variant="contained" color="primary" onClick={() => onEdit(_id)}>
                                    Изменить
                                </Button>
                                <Button variant="contained" color="secondary" onClick={() => onDelete(_id)}>
                                    Удалить
                                </Button>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </Paper>
    );
};