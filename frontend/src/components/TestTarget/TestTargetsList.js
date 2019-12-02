import React from 'react';
import {Badge, Table} from 'react-bootstrap';
import {Error} from '../InvalidState/Error';
import {Loading} from '../InvalidState/Loading';
import {exitCodeToVariant} from '../../helpers/exitCodeToVariant';
import {formatDistance} from 'date-fns';
import {ru} from 'date-fns/locale';

export const TestTargetsList = ({data, loading, error, testSpecs}) => {
    if(loading) return <Loading/>;
    if(error) return <Error error={error}/>;

    return (
        <Table stripped bordered hover>
            <thead>
            <tr>
                <th>#</th>
                <th>Отправлено</th>
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
                           compilerResult,
                           linkerResult,
                           runnerResult
                       }) =>
                <tr>
                    <td>{_id}</td>
                    <td>{formatDistance(new Date(timestamp), new Date, {locale: ru})}</td>
                    <td>
                        {testSpecs.find(({_id}) => _id === testSpecId).name}
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
    );
};