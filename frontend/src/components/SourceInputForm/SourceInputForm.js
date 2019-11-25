import React, {useState} from 'react';
import {Button, Form} from 'react-bootstrap';

export const SourceInputForm = ({onSubmit = undefined, disabled = false, tasksList = []}) => {
    const [formState, setFormState] = useState({
        files: undefined,
        task: ""
    });

    return (<Form onSubmit={onSubmit}>
        <Form.Row>
            <Form.Group>
                <Form.Label>Исходный код:</Form.Label>
                <Form.Control
                    name={"sources"}
                    type={"file"}
                    multiple={true}
                    disabled={disabled}
                    onChange={({target: {files}}) => setFormState({...formState, files})}
                />
            </Form.Group>
            <Form.Group>
                <Form.Label>Задание:</Form.Label>
                <Form.Control
                    name={"testSpecId"}
                    as="select"
                    disabled={disabled}
                    onChange={({target: {value: task}}) => setFormState({...formState, task})}
                >
                    <option/>
                    {tasksList.map(({name, _id}) => <option value={_id} key={_id}>{name}</option>)}
                </Form.Control>
            </Form.Group>
        </Form.Row>
        <Form.Row>
            <Button
                variant="primary"
                type="submit"
                disabled={formState.files === undefined || formState.task === "" || disabled}>
                Отправить
            </Button>
        </Form.Row>
    </Form>);
};