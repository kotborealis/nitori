import {Col, Row} from 'react-bootstrap';
import React from 'react';
import {TestSpecsList} from '../../components/TestSpecsList/TestSpecsList';
import {useApi} from '../../hooks/useApi';
import {TestSpecCreate} from '../../components/TestSpecCreate/TestSpecCreate';
import {TestTargetsList} from '../../components/TestTargetsList/TestTargetsList';
import {useWidgetStore} from '../../store/widget';

export default () => {
    const widgetId = useWidgetStore(({widgetId}) => widgetId);
    const {
        data: testSpecsData,
        loading: testSpecsLoading,
        error: testSpecsError
    } = useApi(`/widgets/${widgetId}/test-specs/`, []);

    const {
        data: testTargetsData,
        loading: testTargetsLoading,
        error: testTargetsError
    } = useApi(`/widgets/${widgetId}/test-targets/`, []);

    const testTargetsDataPopulated = testTargetsData.map(target => {
        target.testSpec = testSpecsData.find(({_id}) => _id === target.testSpecId);
        return target;
    });

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
                        data={testTargetsDataPopulated}
                        loading={testTargetsLoading}
                        error={testTargetsError}
                    />
                </Col>
            </Row>
        </>
    );
};