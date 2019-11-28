import React from 'react';
import {Badge, Table} from 'react-bootstrap';
import {ErrorRenderer} from '../ErrorRenderer/ErrorRenderer';
import {LoadingRenderer} from '../LoadingRenderer/LoadingRenderer';
import {exitCodeToVariant} from '../../helpers/exitCodeToVariant';

export const TestTargetsList = ({data, loading, error}) => {
    if(loading) return <LoadingRenderer/>;
    if(error) return <ErrorRenderer error={error}/>;

    return (
        <>
            <Table stripped bordered hover>
                <thead>
                <tr>
                    <th>#</th>
                    <th>Время</th>
                    <th>Тест</th>
                    <th>Пользователь</th>
                    <th>Проверки</th>
                </tr>
                </thead>
                <tbody>
                {data.map(({
                               _id,
                               timestamp,
                               userData: {name, login},
                               testSpecId,
                               testSpec,
                               compilerResult,
                               linkerResult,
                               runnerResult
                           }) =>
                    <tr>
                        <td>{_id}</td>
                        <td>{(new Date(timestamp)).toISOString()}</td>
                        <td>
                            {!testSpec
                                ? <>{testSpecId} <LoadingRenderer/></>
                                : testSpec.name
                            }
                        </td>
                        <td>{name ? `${name} (${login})` : login}</td>
                        <td>
                            <Badge variant={exitCodeToVariant(compilerResult.exitCode)}>
                                Компиляция
                            </Badge>
                            <Badge variant={exitCodeToVariant(linkerResult.exitCode)}>
                                Линковка
                            </Badge>
                            <Badge variant={exitCodeToVariant(runnerResult.exitCode)}>
                                Тесты
                            </Badge>
                        </td>
                    </tr>
                )}
                </tbody>
            </Table>
        </>
    );
};