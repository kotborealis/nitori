import React, {useEffect, useState} from 'react';
import {Alert, Col, Row} from 'react-bootstrap';
import {SourceInputForm} from '../../../components/SourceInputForm/SourceInputForm';
import {TestOutput} from '../../../components/TestOutput/TestOutput';
import {api} from '../../../api';
import {ProgressbarStages} from '../../../components/ProgressbarStages/ProgressbarStages';
import {useStore} from '../../../store/store';
import {useParams} from 'react-router-dom';

const TestTarget = () => {
    const {widgetId} = useParams();

    const [userDataLoading, userDataError] = useStore(({userData: {loading, error}}) => [loading, error]);

    const [tasksList, taskListLoading] = useStore(({testSpecs: {data, loading}}) => [data, loading]);

    const [outputState, setOutputState] = useState({
        compilerResult: undefined,
        linkerResult: undefined,
        runnerResult: undefined
    });

    const [outputStateLoading, setOutputStateLoading] = useState(false);

    const [testId, setTestId] = useState("");

    useEffect(() => {
        if(testId)
            window.location.hash = testId;

        return () => {
            window.location.hash = "";
        };
    }, [testId]);

    useEffect(() => {
        const hash = window.location.hash.slice(1);
        if(hash){
            (async () => {
                try{
                    const {data} = await api(`/widgets/${widgetId}/test-targets/${hash}`);
                    setOutputState(data);
                }
                catch(error){
                    alert(JSON.stringify(error));
                }finally{
                    setOutputStateLoading(false);
                }
            })();
        }
    }, [window.location.hash]);

    const onSubmit = async (event) => {
        event.preventDefault();

        setOutputState({
            compilerResult: undefined,
            linkerResult: undefined,
            runnerResult: undefined
        });

        setTestId("");

        const formData = new FormData(event.target);

        setOutputStateLoading(true);
        try{
            const {data} = await api(`/widgets/${widgetId}/test-targets/?testSpecId=${formData.get('testSpecId')}`, {
                method: "POST",
                body: formData
            });

            setOutputState(data);
            setTestId(data._id);
        }
        catch(error){
            alert(JSON.stringify(error));
        }finally{
            setOutputStateLoading(false);
        }
    };

    const progressStages = [
        outputState.compilerResult && {
            variant: outputState.compilerResult.exitCode === 0 ? "success" : "danger",
            size: 100 / 3
        },
        outputState.linkerResult && {
            variant: outputState.linkerResult.exitCode === 0 ? "success" : "danger",
            size: 100 / 3
        },
        outputState.runnerResult && {
            variant: outputState.runnerResult.exitCode === 0 ? "success" : "danger",
            size: 100 / 3
        },
    ].filter(id => id);

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
                    <SourceInputForm {...{onSubmit, tasksList}} disabled={outputStateLoading || taskListLoading}/>
                </Col>
            </Row>
            <Row>
                <Col>
                    <ProgressbarStages state={progressStages} loading={outputStateLoading}/>
                </Col>
            </Row>
            <Row>
                <Col>
                    <TestOutput {...outputState}/>
                </Col>
            </Row>
        </>
    );
};

export default TestTarget;