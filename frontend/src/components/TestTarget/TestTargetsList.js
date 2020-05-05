import React, {useEffect, useRef} from 'react';

import {exitCodeToIcon} from '../../helpers/exitCodeToIcon';
import Chip from '@material-ui/core/Chip';
import {exitCodeToColor} from '../../helpers/exitCodeToColor';
import {TimeUpdated} from '../TimeUpdated/TimeUpdated';
import MaterialTable from 'material-table';
import {useHistory, useParams} from 'react-router-dom';
import {apiActions} from '../../api/apiActions';

export const TestTargetsList = () => {
    const history = useHistory();
    const {widgetId} = useParams();
    const tableRef = useRef(null);

    useEffect(() => tableRef.current && tableRef.current.onQueryChange(), [widgetId]);

    return (
        <MaterialTable
            title={"Попытки"}
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
                    render: ({testSpec: {name}}) => name,
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
                    render: ({compilerResult, linkerResult, runnerResult}) => {
                        const CompilerIcon = exitCodeToIcon(compilerResult.exitCode);
                        const LinkerIcon = exitCodeToIcon(linkerResult.exitCode);
                        const RunnerIcon = exitCodeToIcon(runnerResult.exitCode);

                        const compilerColor = exitCodeToColor(compilerResult.exitCode);
                        const linkerColor = exitCodeToColor(linkerResult.exitCode);
                        const runnerColor = exitCodeToColor(runnerResult.exitCode);

                        return (
                            <>
                                <Chip icon={<CompilerIcon/>} color={compilerColor} label="Компиляция"/>
                                <Chip icon={<LinkerIcon/>} color={linkerColor} label="Линковка"/>
                                <Chip icon={<RunnerIcon/>} color={runnerColor} label="Тесты"/>
                            </>
                        );
                    },
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