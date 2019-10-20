import React, {useState} from 'react';
import {Button, Form} from 'react-bootstrap';
import {API_URL} from '../../config';
import {useFetch} from '../hooks/useFetch';

export const SourceInput = ({onSubmit = () => 0, disabled = false}) => {
    const [tasksList, isLoading] = useFetch(API_URL + "/task_list/");

    const [formState, setFormState] = useState({
        files: undefined,
        task: ""
    });

    return (<Form onSubmit={onSubmit}>
        <Form.Row>
            <Form.Group>
                <Form.Label>Исходный код:</Form.Label>
                <Form.Control
                    name={"file"}
                    type={"file"}
                    disabled={isLoading || disabled}
                    onChange={({target: {files}}) => setFormState({...formState, files})}
                />
            </Form.Group>
            <Form.Group>
                <Form.Label>Задание:</Form.Label>
                <Form.Control
                    name={"test_id"}
                    as="select"
                    disabled={isLoading || disabled}
                    onChange={({target: {value: task}}) => setFormState({...formState, task})}
                >
                    <option></option>
                    {tasksList.data ? tasksList.data.map(i => <option value={i}>{i}</option>) : null}
                </Form.Control>
            </Form.Group>
        </Form.Row>
        <Form.Row>
            <Button
                variant="primary"
                type="submit"
                disabled={formState.files === undefined || formState.task === "" || isLoading || disabled}>
                Отправить
            </Button>
        </Form.Row>
    </Form>);
};