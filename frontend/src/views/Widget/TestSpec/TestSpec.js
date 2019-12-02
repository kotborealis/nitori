import React from 'react';
import {TestSpecView} from '../../../components/TestSpecView/TestSpecView';
import {useParams} from 'react-router-dom';
import {useApi} from '../../../hooks/useApi';
import {Col, Row} from 'react-bootstrap';
import {LoadingRenderer} from '../../../components/LoadingRenderer/LoadingRenderer';
import {ErrorRenderer} from '../../../components/ErrorRenderer/ErrorRenderer';

export default () => {
    const {testSpecId, widgetId} = useParams();

    const {
        data,
        loading,
        error
    } = useApi(`widgets/${widgetId}/test-specs/${testSpecId}?includeSources=true`, {});

    let child;

    if(loading)
        child = <LoadingRenderer/>;
    else if(error)
        child = <ErrorRenderer error={error}/>;
    else
        child = <TestSpecView {...data}/>;

    return (<>
        <Row>
            <Col>
                {child}
            </Col>
        </Row>
    </>);
};