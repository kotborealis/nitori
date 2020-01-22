import React from 'react';

import {exitCodeToIcon} from '../../helpers/exitCodeToIcon';
import Chip from '@material-ui/core/Chip';
import {exitCodeToColor} from '../../helpers/exitCodeToColor';
import {useStore} from '../../store/store';
import {TimeUpdated} from '../TimeUpdated/TimeUpdated';
import MaterialTable from 'material-table';
import {useHistory} from 'react-router-dom';
import {api} from '../../api';

export const TestTargetsList = () => {
    const history = useHistory();
    const widgetId = useStore(state => state.widgetId);

    return (
        <MaterialTable
            onRowClick={(event, rowData) => {
                history.push(`/widgets/${widgetId}/test-targets/${rowData._id}`);
            }}
            columns={[
                {
                    title: 'Тест',
                    render: ({testSpec: {name}}) => name
                },
                {
                    title: 'Пользователь',
                    render: ({userData: {name, login}}) => name ? `${name} (${login})` : login
                },
                {
                    title: 'Отправлено',
                    field: 'timestamp',
                    render: ({timestamp}) => <TimeUpdated>{timestamp}</TimeUpdated>
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
                    }
                }
            ]}
            data={async ({
                             page,
                             pageSize,
                             search,
                             orderBy,
                             orderDirection
                         }) => {

                const totalCount = await api(`/widgets/${widgetId}/test-targets/total-count`);

                let data;
                try{
                    data = await api(`/widgets/${widgetId}/test-targets`, {
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
            }}/>
    );
};