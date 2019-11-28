import React, {useState} from 'react';
import {Button, Form} from 'react-bootstrap';

export const TestSpecForm = ({onSubmit, initialName = "", initialDescription = ""}) => {
    const [formState, setFormState] = useState({
        files: undefined,
        name: initialName,
        description: initialDescription,
    });

    return (
        <Form onSubmit={onSubmit}>
            <Form.Row>
                <Form.Group>
                    <Form.Label>Test spec:</Form.Label>
                    <Form.Control
                        name={"sources"}
                        type={"file"}
                        multiple={true}
                        onChange={({target: {files}}) => setFormState({...formState, files})}
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Test spec name:</Form.Label>
                    <Form.Control
                        name={"name"}
                        type={"text"}
                        onChange={({target: {value: name}}) => setFormState({...formState, name})}
                        value={formState.name}
                    />
                </Form.Group>
            </Form.Row>
            <Form.Row>
                <Form.Group style={{width: '100%'}}>
                    <Form.Label>Test spec description:</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows="3"
                        name={"description"}
                        onChange={({target: {value: description}}) => setFormState({...formState, description})}
                        value={formState.description}
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
    );
};