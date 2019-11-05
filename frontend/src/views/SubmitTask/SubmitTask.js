import {Button, Container, Form, Row, Col} from 'react-bootstrap';
import React, {useState} from 'react';
import styles from './SubmitTask.css';
import {api} from '../../api';
import {SourceInputForm} from '../../SourceInputForm/SourceInputForm';
import TestingProgressbar from '../../TestingProgressbar/TestingProgressbar';
import {TestOutput} from '../../TestOutput/TestOutput';
import {TestOutputDefaultState} from '../../utils/TestOutputDefaultState';

export default () => {
    const [formState, setFormState] = useState({
        files: undefined,
        wid: "0",
        name: "",
    });

    const [outputState, setOutputState] = useState(TestOutputDefaultState());
    const [outputStateLoading, setOutputStateLoading] = useState(false);

    const onSubmit = async (event) => {
        event.preventDefault();

        setOutputState(TestOutputDefaultState());

        const formData = new FormData(event.target);

        setOutputStateLoading(true);
        const res = await api("task", {
            method: "POST",
            body: formData
        });

        const {data, error} = await res.json();

        if(error){
            alert(JSON.stringify(error));
            setOutputStateLoading(false);
        }
        else{
            setOutputState({
                ...TestOutputDefaultState(),
                ...data
            });
            setOutputStateLoading(false);
        }
    };

    return (<Container className={styles.container}>
        <Row className={styles.row}>
            <Col>
                <Form onSubmit={onSubmit}>
                    <Form.Row>
                        <Form.Group>
                            <Form.Label>sources:</Form.Label>
                            <Form.Control
                                name={"sources"}
                                type={"file"}
                                multiple={true}
                                onChange={({target: {files}}) => setFormState({...formState, files})}
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>wid:</Form.Label>
                            <Form.Control
                                name={"wid"}
                                type={"text"}
                                onChange={({target: {value: wid}}) => setFormState({...formState, wid})}
                                value={formState.wid}
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>name:</Form.Label>
                            <Form.Control
                                name={"name"}
                                type={"text"}
                                onChange={({target: {value: name}}) => setFormState({...formState, name})}
                                value={formState.name}
                            />
                        </Form.Group>
                    </Form.Row>
                    <Form.Row>
                        <Button
                            variant="primary"
                            type="submit"
                        >
                            Отправить
                        </Button>
                    </Form.Row>
                </Form>
            </Col>
        </Row>
        <Row className={styles.row}>
            <Col>
                <TestingProgressbar state={outputState} loading={outputStateLoading}/>
            </Col>
        </Row>
        <Row className={styles.row}>
            <Col>
                <TestOutput {...outputState}/>
            </Col>
        </Row>
    </Container>);
}