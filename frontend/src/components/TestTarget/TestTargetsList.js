import React, {useEffect, useRef} from 'react';
import {TimeUpdated} from '../TimeUpdated/TimeUpdated';
import MaterialTable from 'material-table';
import {useHistory, useParams} from 'react-router-dom';
import {apiActions} from '../../api/apiActions';
import {testTargetResultBadges} from './testTargetResultBadges';
import {TestSpecName} from '../TestSpec/TestSpecName';

export const TestTargetsList = () => {
    const history = useHistory();
    const {widgetId} = useParams();
    const tableRef = useRef(null);

    useEffect(() => tableRef.current && tableRef.current.onQueryChange(), [widgetId]);

    return (
        <MaterialTable
            title={"Решения"}
            tableRef={tableRef}
            options={{
                showTitle: true,
                search: true
            }}

            onRowClick={(event, rowData) => {
                history.push(`/dashboard/${widgetId}/test-targets/${rowData._id}`);
            }}

            columns={[
                {
                    title: 'Тест',
                    render: ({testSpec}) => <TestSpecName testSpecId={testSpec} widgetId={widgetId}/>,
                    sorting: false,
                },
                {
                    title: 'Пользователь',
                    render: ({userData: {name, login}}) => name ? `${name} (${login})` : login,
                    sorting: false,
                },
                {
                    title: 'Отправлено',
                    render: ({timestamp}) => <TimeUpdated>{timestamp}</TimeUpdated>,
                    sorting: true,
                    sortingField: 'timestamp',
                },
                {
                    title: 'Проверки',
                    render: testTargetResultBadges,
                    sorting: false
                }
            ]}

            data={async ({
                             page,
                             pageSize,
                             search,
                             orderBy,
                             orderDirection
                         }) => {
                const totalCount = await apiActions.testTargetsTotalCount({widgetId});

                let data;
                try{
                    data = await apiActions.testTargets({
                        widgetId,
                        limit: pageSize,
                        skip: page * pageSize,
                        userDataName: search,
                        sortBy: orderBy ? orderBy.sortingField : undefined,
                        orderBy: orderDirection,
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
            }}/>
    );
};