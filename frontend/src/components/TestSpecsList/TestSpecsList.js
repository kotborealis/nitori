import React from 'react';
import {Table} from 'react-bootstrap';
import {ErrorRenderer} from '../ErrorRenderer/ErrorRenderer';
import {LoadingRenderer} from '../LoadingRenderer/LoadingRenderer';
import {api_url} from '../../api';

export const TestSpecsList = ({data, loading, error}) => {
    if(loading) return <LoadingRenderer/>;
    if(error) return <ErrorRenderer error={error}/>;

    return (
        <>
            <Table stripped bordered hover>
                <thead>
                <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Updated at</th>
                    <th>Source</th>
                </tr>
                </thead>
                <tbody>
                {data.map(({_id, name, description, timestamp}) => <tr>
                    <td>{_id}</td>
                    <td>{name}</td>
                    <td>{description}</td>
                    <td>{(new Date(timestamp)).toISOString()}</td>
                    <td>
                        <a href={api_url(`/widgets/0/test-specs/${_id}/source`)} target="_blank">
                            {name}.cpp
                        </a>
                    </td>
                </tr>)}
                </tbody>
            </Table>
        </>
    );
};