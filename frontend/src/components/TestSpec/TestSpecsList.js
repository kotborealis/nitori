import React, {useEffect, useRef} from 'react';
import {useHistory, useParams} from 'react-router-dom';
import {TimeUpdated} from '../TimeUpdated/TimeUpdated';
import MaterialTable from 'material-table';
import {apiActions} from '../../api/apiActions';
import {Typography} from '@material-ui/core';

export const TestSpecsList = () => {
    const history = useHistory();
    const {widgetId} = useParams();
    const tableRef = useRef(null);

    useEffect(() => tableRef.current && tableRef.current.onQueryChange(), [widgetId]);

    return (
        <MaterialTable
            title={"Задания"}
            tableRef={tableRef}
            options={{
                showTitle: true,
                search: false,
                actionsColumnIndex: -1
            }}

            onRowClick={(event, rowData) => {
                history.push(`/dashboard/${widgetId}/test-specs/${rowData._id}`);
            }}

            columns={[
                {
                    title: 'Название',
                    render: ({name}) => <Typography>{name}</Typography>,
                    sorting: false,
                },
                {
                    title: 'Обновлено',
                    render: ({timestamp}) => <Typography><TimeUpdated>{timestamp}</TimeUpdated></Typography>,
                    sorting: true,
                    sortingField: 'timestamp'
                }
            ]}

            actions={[
                {
                    icon: 'delete',
                    tooltip: 'Удалить задание',
                    onClick: async (event, entity) =>
                        confirm(`Удалить задание ${entity.name}?`)
                        && await apiActions.testSpecDelete({widgetId: entity.widget, testSpecId: entity._id})
                        && tableRef.current.onQueryChange()
                }
            ]}

            data={async ({
                             page,
                             pageSize,
                             search,
                             orderBy,
                             orderDirection
                         }) => {

                const totalCount = await apiActions.testSpecsTotalCount({widgetId});

                let data;
                try{
                    data = await apiActions.testSpecs({
                        widgetId,
                        limit: pageSize,
                        skip: page * pageSize,
                        name: search,
                        sortBy: orderBy ? orderBy.sortingField : undefined,
                        orderBy: orderDirection
                    });
                }
                catch(e){
                    console.error(e);
                    return {
                        data: [],
                        page: 0,
                        totalCount: 0
                    };
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