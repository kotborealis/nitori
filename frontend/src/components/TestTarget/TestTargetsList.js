import React from 'react';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import {exitCodeToIcon} from '../../helpers/exitCodeToIcon';
import Chip from '@material-ui/core/Chip';
import {exitCodeToColor} from '../../helpers/exitCodeToColor';
import {Link} from 'react-router-dom';
import {useStore} from '../../store/store';
import {TimeUpdated} from '../TimeUpdated/TimeUpdated';

export const TestTargetsList = ({data}) => {
    const widgetId = useStore(state => state.widgetId);

    return (
        <Paper>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Тест</TableCell>
                        <TableCell>Пользователь</TableCell>
                        <TableCell>Отправлено</TableCell>
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
                                   runnerResult,
                                   testSpec
                               }) =>
                        <TableRow
                            component={Link}
                            to={`/widgets/${widgetId}/test-targets/${_id}`}
                            style={{textDecoration: 'none'}}
                        >
                            <TableCell>{testSpec.name}</TableCell>
                            <TableCell>{name ? `${name} (${login})` : login}</TableCell>
                            <TableCell><TimeUpdated>{timestamp}</TimeUpdated></TableCell>
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