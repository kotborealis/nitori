import React from 'react';
import {Link} from 'react-router-dom';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import {useStore} from '../../store/store';
import {TimeUpdated} from '../TimeUpdated/TimeUpdated';

export const TestSpecsList = ({data, onDelete, onEdit}) => {
    const widgetId = useStore(state => state.widgetId);

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
                            <TableCell><TimeUpdated>{timestamp}</TimeUpdated></TableCell>
                            <TableCell>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </Paper>
    );
};