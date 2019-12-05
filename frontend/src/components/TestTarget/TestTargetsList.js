import React from 'react';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

import {Error} from '../InvalidState/Error';
import {Loading} from '../InvalidState/Loading';
import {formatDistance} from 'date-fns';
import {ru} from 'date-fns/locale';
import {exitCodeToIcon} from '../../helpers/exitCodeToIcon';
import Chip from '@material-ui/core/Chip';
import {exitCodeToColor} from '../../helpers/exitCodeToColor';
import {Link, useParams} from 'react-router-dom';

export const TestTargetsList = ({data, loading, error, testSpecs}) => {
    const {widgetId} = useParams();

    if(loading) return <Loading/>;
    if(error) return <Error error={error}/>;

    return (
        <Paper>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>Отправлено</TableCell>
                        <TableCell>Тест</TableCell>
                        <TableCell>Пользователь</TableCell>
                        <TableCell>Проверки</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.map(({
                                   _id,
                                   timestamp,
                                   userData: {name, login},
                                   testSpecId,
                                   compilerResult,
                                   linkerResult,
                                   runnerResult
                               }) => <TableRow component={Link} to={`/widgets/${widgetId}/test-targets/${_id}`}>
                        <TableCell>{_id}</TableCell>
                        <TableCell>{formatDistance(new Date(timestamp), new Date, {locale: ru})} назад</TableCell>
                        <TableCell>{testSpecs.find(({_id}) => _id === testSpecId).name}</TableCell>
                        <TableCell>{name ? `${name} (${login})` : login}</TableCell>
                        <TableCell>
                            {(() => {
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
                            })()}
                        </TableCell>
                    </TableRow>)}
                </TableBody>
            </Table>
        </Paper>
    );
};