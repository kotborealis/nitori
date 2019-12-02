import {Col, Row} from 'react-bootstrap';
import React, {useEffect} from 'react';
import {TestSpecsList} from '../../../components/TestSpec/TestSpecsList';
import {TestSpecCreate} from '../../../components/TestSpec/TestSpecCreate';
import {TestTargetsList} from '../../../components/TestTarget/TestTargetsList';
import {useStore} from '../../../store/store';
import {useParams} from 'react-router-dom';

export default () => {
    const {widgetId} = useParams();
    // Fetch test targets
    const fetchTestTargets = useStore(({testTargets: {fetch}}) => fetch);
    useEffect(() => void fetchTestTargets([widgetId]), [widgetId]);

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