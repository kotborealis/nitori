import React, {useEffect, useState} from 'react';
import {Alert, Button, Col, Container, Form, Navbar, Row} from 'react-bootstrap';
import {API_URL} from '../../config';
import AnsiRenderer from './AnsiRenderer';

const App = () => {
    const [isLoading, setLoading] = useState(true);

    const [tasksList, setTasksList] = useState([]);

    useEffect(() => {
        (async () => {
            setTasksList((await (await fetch(API_URL + "/list_tests/")).json()).data);
            setLoading(false);
        })();
    }, []);

    const [formState, setFormState] = useState({
        files: undefined,
        task: ""
    });

    const defaultOutputState = () => ({
        targetCompilation: {exitCode: undefined, stdout: ""},
        testCompilation: {exitCode: undefined, stdout: ""},
        testRunner: {exitCode: undefined, stdout: ""},
    });

    const [outputState, setOutputState] = useState(defaultOutputState());

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);

        setLoading(true);
        setOutputState(defaultOutputState());

        const res = await fetch(API_URL + "/test_target/", {
            method: "POST",
            body: formData
        });

        setLoading(false);

        const json = await res.json();

        setOutputState({...defaultOutputState(), ...json.data});
    };

    const exitCodeToAlertVariant = (code) => {
        if(code === 0) return 'success';
        if(code === undefined) return 'light';
        return 'danger';
    };

    return (<div>
        <Navbar bg={"dark"} variant="dark" expand={"lg"}>
            <Navbar.Brand>Nitori</Navbar.Brand>
        </Navbar>
        <Container style={{marginTop: "20px"}}>
            <Row>
                <Col>
                    <Form onSubmit={onSubmitHandler}>
                        <Form.Row>
                            <Form.Group>
                                <Form.Label>Исходный код:</Form.Label>
                                <Form.Control
                                    name={"file"}
                                    type={"file"}
                                    disabled={isLoading}
                                    onChange={({target: {files}}) => setFormState({...formState, files})}
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Задание:</Form.Label>
                                <Form.Control
                                    name={"test_id"}
                                    as="select"
                                    disabled={isLoading}
                                    onChange={({target: {value: task}}) => setFormState({...formState, task})}
                                >
                                    <option></option>
                                    {tasksList.map(i => <option value={i}>{i}</option>)}
                                </Form.Control>
                            </Form.Group>
                        </Form.Row>
                        <Form.Row>
                            <Button
                                variant="primary"
                                type="submit"
                                disabled={formState.files === undefined || formState.task === "" || isLoading}>
                                Отправить
                            </Button>
                        </Form.Row>
                    </Form>
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
        </Container>
    </div>);
};

export default App;