import React from 'react';
import {useHistory} from 'react-router-dom';
import {useStore} from '../../store/store';
import {TimeUpdated} from '../TimeUpdated/TimeUpdated';
import MaterialTable from 'material-table';
import {api} from '../../api';

export const TestSpecsList = () => {
    const history = useHistory();
    const widgetId = useStore(state => state.widgetId);

    return (
        <MaterialTable
            onRowClick={(event, rowData) => {
                history.push(`/widgets/${widgetId}/test-specs/${rowData._id}`);
            }}
            columns={[
                {
                    title: 'Название',
                    render: ({name}) => name
                },
                {
                    title: 'Описание',
                    render: ({description}) => description
                },
                {
                    title: 'Обновлено',
                    render: ({timestamp}) => <TimeUpdated>{timestamp}</TimeUpdated>
                }
            ]}
            data={async ({
                             page,
                             pageSize,
                             search,
                             orderBy,
                             orderDirection
                         }) => {

                const totalCount = await api(`/widgets/${widgetId}/test-specs/total-count`);

                let data;
                try{
                    data = await api(`/widgets/${widgetId}/test-specs`, {
                        query: {
                            limit: pageSize,
                            skip: page * pageSize,
                            ...(search ? {userDataName: search} : {}),
                            ...(orderBy ? {sortBy: orderBy} : {}),
                            ...(orderDirection ? {orderBy: orderDirection} : {}),
                        }
                    });
                }
                catch(e){
                    data = [{}];
                }

                return {
                    data,
                    page,
                    totalCount
                };
            }}
        />
    );
};

//export const TestSpecsList = ({onDelete, onEdit}) => {
//    const testSpecs = useApiStore("testSpecs");
//    const widgetId = useStore(state => state.widgetId);
//
//    return <MaterialTable columns={[
//        {title: "Название", field: "name"},
//        {title: "Описание", field: "description"},
//        {
//            title: "Обновлено",
//            field: "timestamp",
//            render: ({timestamp}) => <TimeUpdated>{timestamp}</TimeUpdated>
//        }
//    ]} data={async query => {
//        console.log(query);
//        await testSpecs.fetch({
//            limit: query.pageSize,
//            skip: query.pageSize * query.page,
//            sortBy: query.orderBy,
//            orderBy: query.orderDirection
//        });
//        return {
//            data: testSpecs.data,
//            page: query.page,
//            totalCount: 10000000
//        };
//    }}/>;
//
//    return (
//        <Paper>
//            <Table>
//                <TableHead>
//                    <TableRow>
//                        <TableCell>Название</TableCell>
//                        <TableCell>Описание</TableCell>
//                        <TableCell>Обновлено</TableCell>
//                        <TableCell>Действие</TableCell>
//                    </TableRow>
//                </TableHead>
//                <TableBody>
//                    {data.map(({_id, name, description, timestamp}) =>
//                        <TableRow
//                            style={{textDecoration: 'none'}}
//                        >
//                            <TableCell
//                                component={Link}
//                                style={{textDecoration: 'none'}}
//                                to={`/widgets/${widgetId}/test-specs/${_id}`}
//                            >{name}</TableCell>
//                            <TableCell>{description}</TableCell>
//                            <TableCell><TimeUpdated>{timestamp}</TimeUpdated></TableCell>
//                            <TableCell>
//                                <Button variant="contained" color="primary" onClick={() => {
//                                    onEdit(_id);
//                                    return false;
//                                }}>
//                                    Изменить
//                                </Button>
//                                <Button variant="contained" color="secondary" onClick={() => {
//                                    onDelete(_id);
//                                    return false;
//                                }}>
//                                    Удалить
//                                </Button>
//                            </TableCell>
//                        </TableRow>
//                    )}
//                </TableBody>
//            </Table>
//        </Paper>
//    );
//};