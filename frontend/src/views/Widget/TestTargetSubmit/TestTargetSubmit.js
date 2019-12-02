import React from 'react';
import {Alert, Col, Row} from 'react-bootstrap';
import {SourceInputForm} from '../../../components/SourceInputForm/SourceInputForm';
import {useStore} from '../../../store/store';
import {useParams} from 'react-router-dom';
import {TestTarget} from '../../../components/TestTarget/TestTarget';
import {Loading} from '../../../components/InvalidState/Loading';
import {Error} from '../../../components/InvalidState/Error';

export const TestTargetSubmit = () => {
    const {widgetId} = useParams();

    const [userDataLoading, userDataError] = useStore(({userData: {loading, error}}) => [loading, error]);

    const [tasksList, taskListLoading] = useStore(({testSpecs: {data, loading}}) => [data, loading]);

    const postTestTarget = useStore(({testTargetSubmit: {fetch}}) => fetch);

    const [
        testTarget,
        testTargetLoading,
        testTargetError
    ] = useStore(({testTargetSubmit: {data, loading, error}}) => [data, loading, error]);

    const testSpecId = testTarget && testTarget.testSpecId;
    const testSpecLoading = useStore(({testSpecs: {loading}}) => loading);
    const testSpecError = useStore(({testSpecs: {error}}) => error);
    const testSpec = useStore(({testSpecs: {data}}) => data.find(({_id}) => _id === testSpecId));

    const error = testTargetError || testSpecError;
    const loading = testTargetLoading;

    const onSubmit = event => {
        event.preventDefault();

        const formData = new FormData(event.target);
        const testSpecId = formData.get('testSpecId');

        postTestTarget([widgetId, testSpecId], {body: formData});
    };

    let result = null;


    if(loading === true)
        result = <Loading/>;
    else if(error)
        result = <Error error={error}/>;
    else if(testTarget === null)
        result = null;
    else
        result = <TestTarget output={testTarget} testSpec={testSpec}/>;

    return (
        <>
            {(!userDataLoading && userDataError) && (<Row>
                <Col>
                    <Alert variant={"danger"}>
                        <Alert.Heading>Требуется аутентификация</Alert.Heading>
                        <p><a href={process.env.AUTH_PATH}>Аутентификация</a></p>
                    </Alert>
                </Col>
            </Row>)}
            <Row>
                <Col>
                    <SourceInputForm {...{onSubmit, tasksList}} disabled={loading || taskListLoading}/>
                </Col>
            </Row>
            <Row>
                {result}
            </Row>
        </>
    );
};