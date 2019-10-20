import React, {useState} from 'react';
import {Col, Container, Row} from 'react-bootstrap';
import {SourceInput} from '../SourceInputForm/SourceInputForm';
import {TestOutput, TestOutputDefaultState} from '../TestOutput/TestOutput';
import styles from './App.css';

const App = () => {
    const [outputState, setOutputState] = useState(TestOutputDefaultState());

    const onSubmitStart = () => setOutputState(TestOutputDefaultState());

    const onSubmitEnd = ({data, error}) => {
        if(data){
            setOutputState({
                ...TestOutputDefaultState(),
                ...data
            });
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

    return (<Container className={styles.container}>
        <Row className={styles.row}>
            <Col>
                <SourceInput {...{onSubmitStart, onSubmitEnd}}/>
            </Col>
        </Row>
        <Row>
            <Col>
                <TestOutput {...outputState}/>
            </Col>
        </Row>
    </Container>);
};

export default App;