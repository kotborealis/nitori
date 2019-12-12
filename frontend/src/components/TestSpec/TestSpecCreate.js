import React, {useRef, useState} from 'react';
import {TestSpecInputForm} from './TestSpecInputForm';
import {api} from '../../api';
import {Error} from '../InvalidState/Error';
import {Tty} from '../Tty/Tty';
import Grid from '@material-ui/core/Grid';
import {useStore} from '../../store/store';

export const TestSpecCreate = ({}) => {
    const widgetId = useStore(state => state.widgetId);

    const [outputState, setOutputState] = useState({});
    const [outputLoading, setOutputLoading] = useState(false);
    const [isError, setIsError] = useState(false);

    const outputError = useRef({});

    const testSpecFormSubmit = async (event) => {
        event.preventDefault();

        setIsError(false);

        setOutputState({});
        const formData = new FormData(event.target);
        setOutputLoading(true);

        try{
            const {compilerResult} = await api(`widgets/${widgetId}/test-specs/`,
                {
                    query: {
                        name: formData.get('name'),
                        description: formData.get('description')
                    },
                    options: {
                        method: "POST",
                        body: formData
                    }
                }
            );

            setOutputState(compilerResult);
        }
        catch(error){
            outputError.current = error;
            setIsError(true);
        }finally{
            setOutputLoading(false);
        }
    };

    return (
        <Grid container>
            <Grid item xs={12}>
                <TestSpecInputForm onSubmit={testSpecFormSubmit}/>
            </Grid>
            <Grid item xs={12}>
                {isError
                    ? <Error error={outputError.current}/>
                    : <Tty
                        title={
                            outputState.exitCode === undefined
                                ? `Не выполнено`
                                : `Код возврата: ${outputState.exitCode}`
                        }
                        {...outputState}
                    />
                }
            </Grid>
        </Grid>
    );
};