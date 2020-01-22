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

                const totalCount = await api(`/widgets/${widgetId}/test-specs/total-count`);

                let data;
                try{
                    data = await api(`/widgets/${widgetId}/test-specs`, {
                        query: {
                            limit: pageSize,
                            skip: page * pageSize,
                            ...(search ? {userDataName: search} : {}),
                            ...(orderBy ? {sortBy: orderBy.sortingField} : {}),
                            ...(orderDirection ? {orderBy: orderDirection} : {}),
                        }
                    });
                }
                catch(e){
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