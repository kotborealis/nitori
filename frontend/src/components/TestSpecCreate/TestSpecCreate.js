import React, {useRef, useState} from 'react';
import {TestSpecForm} from './TestSpecForm/TestSpecForm';
import {ProgressbarStages} from '../ProgressbarStages/ProgressbarStages';
import {BlockContainer} from '../BlockContainer/BlockContainer';
import {Col, Row} from 'react-bootstrap';
import {api} from '../../api';
import {ErrorRenderer} from '../ErrorRenderer/ErrorRenderer';
import TtyRenderer from '../TtyRenderer/TtyRenderer';
import {useStoreWidget} from '../../store/widget';

export const TestSpecCreate = ({}) => {
    const widgetId = useStoreWidget(({widgetId}) => widgetId);

    const [outputState, setOutputState] = useState(null);
    const [outputLoading, setOutputLoading] = useState(false);
    const [isError, setIsError] = useState(false);

    const outputError = useRef({});

    const progressStages = [
        outputState && {
            variant: outputState.exitCode === 0 ? "success" : "danger",
            size: 100
        }
    ].filter(id => id);

    const testSpecFormSubmit = async (event) => {
        event.preventDefault();

        setIsError(false);

        setOutputState({});
        const formData = new FormData(event.target);
        setOutputLoading(true);

        try{
            const {data} = await api(`widgets/${widgetId}/test-specs/?name=${formData.get('name')}&description=${formData.get('description')}`,
                {
                    method: "POST",
                    body: formData
                }
            );

            setOutputState(data);
        }
        catch(error){
            outputError.current = error;
            setIsError(true);
        }finally{
            setOutputLoading(false);
        }
    };

    return (
        <BlockContainer>
            <Row>
                <Col>
                    <TestSpecForm onSubmit={testSpecFormSubmit}/>
                </Col>
            </Row>
            <Row>
                <Col>
                    <ProgressbarStages state={progressStages} loading={outputLoading}/>
                </Col>
            </Row>
            <Row>
                <Col>
                    {isError
                        ? <ErrorRenderer error={outputError.current}/>
                        : <TtyRenderer title="Компиляция" {...outputState}/>
                    }
                </Col>
            </Row>
        </BlockContainer>
    );
};