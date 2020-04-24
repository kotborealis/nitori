import React from 'react';
import {useHistory, useParams} from 'react-router-dom';
import {TimeUpdated} from '../TimeUpdated/TimeUpdated';
import MaterialTable from 'material-table';
import {apiActions} from '../../api/apiActions';

export const TestSpecsList = () => {
    const history = useHistory();
    const {widgetId} = useParams();

    return (
        <MaterialTable
            options={{
                showTitle: false,
                search: false
            }}

            onRowClick={(event, rowData) => {
                history.push(`/widgets/${widgetId}/test-specs/${rowData._id}`);
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
                    console.log("TRY DATA FETCH");
                    data = await apiActions.testSpecs({
                        widgetId,
                        limit: pageSize,
                        skip: page * pageSize,
                        name: search,
                        sortBy: orderBy ? orderBy.sortingField : undefined,
                        orderBy: orderDirection,
                    });
                    console.log(data);
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