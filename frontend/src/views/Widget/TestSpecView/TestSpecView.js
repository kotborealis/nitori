import React from 'react';
import {TestSpec} from '../../../components/TestSpec/TestSpec';
import {useParams} from 'react-router-dom';
import {useApi} from '../../../hooks/useApi';
import {Col, Row} from 'react-bootstrap';
import {Loading} from '../../../components/InvalidState/Loading';
import {Error} from '../../../components/InvalidState/Error';

export default () => {
    const {testSpecId, widgetId} = useParams();

    const {
        data,
        loading,
        error
    } = useApi(`widgets/${widgetId}/test-specs/${testSpecId}?includeSources=true`, {});

    let child;

    if(loading)
        child = <Loading/>;
    else if(error)
        child = <Error error={error}/>;
    else
        child = <TestSpec {...data}/>;

    return (<>
        <Row>
            <Col>
                {child}
            </Col>
        </Row>
    </>);
};