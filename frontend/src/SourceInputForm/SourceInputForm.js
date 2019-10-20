import React, {useEffect, useState} from 'react';
import {Button, Form} from 'react-bootstrap';
import {API_URL} from '../../config';

export const SourceInput = ({onSubmitStart = () => 0, onSubmitEnd = () => 0}) => {
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

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);

        setLoading(true);

        onSubmitStart();

        const res = await fetch(API_URL + "/test_target/", {
            method: "POST",
            body: formData
        });

        setLoading(false);

        onSubmitEnd(await res.json());
    };

    return (<Form onSubmit={onSubmitHandler}>
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
    </Form>);
};