import {Button, Col, Form, Row} from 'react-bootstrap';
import React, {useState} from 'react';
import styles from './TestSpec.css';
import {api} from '../../api';
import {ProgressbarStages} from '../../components/ProgressbarStages/ProgressbarStages';
import {TestOutput} from '../../components/TestOutput/TestOutput';
import {TestOutputDefaultState} from '../../components/TestOutput/TestOutputDefaultState';
import {useStore} from '../../store/store';

export default () => {
    const widgetId = useStore(({widgetId}) => widgetId);

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

        try{
            const {data} = await api(`widgets/${widgetId}/test-specs/?name=${formData.get('name')}&description=${formData.get('description')}`,
                {
                    method: "POST",
                    body: formData
                }
            );

            setOutputState({
                ...TestOutputDefaultState(),
                ...data
            });
        }
        catch(error){
            alert(JSON.stringify(error));
        }finally{
            setOutputStateLoading(false);
        }
    };

    const progressStages = [
        outputState.compilerResult && {
            variant: outputState.compilerResult.exitCode === 0 ? "success" : "danger",
            size: 100
        },
    ].filter(id => id);

    return (
        <>
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
                                    onChange={({target: {value: {name}}}) => setFormState({...formState, name})}
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
                    <ProgressbarStages state={progressStages} loading={outputStateLoading}/>
                </Col>
            </Row>
            <Row className={styles.row}>
                <Col>
                    <TestOutput {...outputState}/>
                </Col>
            </Row>
        </>
    );
}