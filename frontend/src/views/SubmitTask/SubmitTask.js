import {Button, Container, Form, Row, Col} from 'react-bootstrap';
import React, {useState} from 'react';
import styles from './SubmitTask.css';
import {api} from '../../api';

export default () => {
    const [formState, setFormState] = useState({
        files: undefined,
        wid: "0",
        name: "",
    });

    const onSubmit = async (event) => {
        event.preventDefault();

        const formData = new FormData(event.target);
        const res = await api("task", {
            method: "POST",
            body: formData
        });
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
    </Container>);
}