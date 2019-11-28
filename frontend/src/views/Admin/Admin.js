import {Col, Row} from 'react-bootstrap';
import React from 'react';
import {TestSpecsList} from '../../components/TestSpecsList/TestSpecsList';
import {useApi} from '../../hooks/useApi';
import {TestSpecCreate} from '../../components/TestSpecCreate/TestSpecCreate';

export default () => {
    const {
        data: testSpecsData,
        loading: testSpecsLoading,
        error: testSpecsError
    } = useApi('/widgets/0/test-specs/', []);

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
        </>
    );
};