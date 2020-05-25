import React, {useEffect, useRef} from 'react';
import {useHistory, useParams} from 'react-router-dom';
import {TimeUpdated} from '../TimeUpdated/TimeUpdated';
import MaterialTable from 'material-table';
import {apiActions} from '../../api/apiActions';

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
                search: false
            }}

            onRowClick={(event, rowData) => {
                history.push(`/dashboard/${widgetId}/test-specs/${rowData._id}`);
            }}

            columns={[
                {
                    title: 'Название',
                    render: ({name}) => name,
                    sorting: false,
                },
                {
                    title: 'Описание',
                    render: ({description}) => description,
                    sorting: false,
                },
                {
                    title: 'Обновлено',
                    render: ({timestamp}) => <TimeUpdated>{timestamp}</TimeUpdated>,
                    sorting: true,
                    sortingField: 'timestamp'
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