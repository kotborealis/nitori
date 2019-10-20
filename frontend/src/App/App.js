import React, {useState} from 'react';
import {Col, Container, Row} from 'react-bootstrap';
import {SourceInput} from '../SourceInputForm/SourceInputForm';
import {TestOutput, TestOutputDefaultState} from '../TestOutput/TestOutput';
import styles from './App.css';
import {API_URL} from '../../config';

const App = () => {
    const [outputState, setOutputState] = useState(TestOutputDefaultState());
    const [loading, setLoading] = useState(false);

    const onSubmit = async (event) => {
        event.preventDefault();

        setOutputState(TestOutputDefaultState());

        const formData = new FormData(event.target);

        setLoading(true);
        const res = await fetch(API_URL + "/test_target/", {
            method: "POST",
            body: formData
        });
        setLoading(false);

        const {data, error} = await res.json();

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

    return (<Container className={styles.container}>
        <Row className={styles.row}>
            <Col>
                <SourceInput {...{onSubmit}} disabled={loading}/>
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