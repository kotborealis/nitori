import {Col, Row} from 'react-bootstrap';
import React from 'react';
import {TestSpecsList} from '../../../components/TestSpecsList/TestSpecsList';
import {TestSpecCreate} from '../../../components/TestSpecCreate/TestSpecCreate';
import {TestTargetsList} from '../../../components/TestTargetsList/TestTargetsList';
import {useStore} from '../../../store/store';

export default () => {
    const [
        testSpecsData,
        testSpecsLoading,
        testSpecsError
    ] = useStore(({testSpecs: {data, loading, error}}) => [data, loading, error]);

    const [
        testTargetsData,
        testTargetsLoading,
        testTargetsError
    ] = useStore(({testTargets: {data, loading, error}}) => [data, loading, error]);

    return (
        <>
            <Row>
                <Col>
                    <h2>Добавить тест</h2>
                    <TestSpecCreate/>
                </Col>
            </Row>
            <Row>
                <Col>
                    <h2>Список тестов</h2>
                    <TestSpecsList
                        data={testSpecsData}
                        loading={testSpecsLoading}
                        error={testSpecsError}
                    />
                </Col>
            </Row>
            <Row>
                <Col>
                    <h2>Список таргетов</h2>
                    <TestTargetsList
                        data={testTargetsData}
                        loading={testTargetsLoading || testSpecsLoading}
                        error={testTargetsError || testSpecsLoading}
                        testSpecs={testSpecsData}
                    />
                </Col>
            </Row>
        </>
    );
};