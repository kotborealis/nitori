import React, {useState} from 'react';
import {Alert, Col, Container, Row} from 'react-bootstrap';
import AnsiRenderer from './AnsiRenderer';
import {SourceInput} from '../SourceInputForm/SourceInputForm';

const App = () => {
    const defaultOutputState = () => ({
        targetCompilation: {exitCode: undefined, stdout: ""},
        testCompilation: {exitCode: undefined, stdout: ""},
        testRunner: {exitCode: undefined, stdout: ""},
    });

    const [outputState, setOutputState] = useState(defaultOutputState());

    const onSubmitStart = () => setOutputState(defaultOutputState());

    const onSubmitEnd = ({data, error}) => {
        if(data){
            setOutputState({...defaultOutputState(), ...data});
        }
        else if(error){
            alert(JSON.stringify(error));
        }
    };

    const exitCodeToAlertVariant = (code) => {
        if(code === 0) return 'success';
        if(code === undefined) return 'light';
        return 'danger';
    };

    return (<Container style={{padding: "20px"}}>
        <Row>
            <Col>
                <SourceInput onSubmitStart={onSubmitStart} onSubmitEnd={onSubmitEnd}/>
            </Col>
        </Row>
        <Row>
            <Col>
                <div>
                    <Alert variant={exitCodeToAlertVariant(outputState.targetCompilation.exitCode)}>
                        Компиляция
                    </Alert>
                    <AnsiRenderer>{outputState.targetCompilation.stdout}</AnsiRenderer>
                </div>
                <div>
                    <Alert variant={exitCodeToAlertVariant(outputState.testCompilation.exitCode)}>
                        Линковка
                    </Alert>
                    <AnsiRenderer>{outputState.testCompilation.stdout}</AnsiRenderer>
                </div>
                <div>
                    <Alert variant={exitCodeToAlertVariant(outputState.testRunner.exitCode)}>
                        Тестирование
                    </Alert>
                    <AnsiRenderer>{outputState.testRunner.stdout}</AnsiRenderer>
                </div>
            </Col>
        </Row>
    </Container>);
};

export default App;