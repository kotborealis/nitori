import React from 'react';
import {TestSpecInputForm} from './TestSpecInputForm';
import {Error} from '../InvalidState/Error';
import {Tty} from '../Tty/Tty';
import Grid from '@material-ui/core/Grid';
import {useParams} from 'react-router-dom';
import {apiActions} from '../../api/apiActions';
import {useApi} from '../../api/useApi';

export const TestSpecCreate = ({}) => {
    const {widgetId} = useParams();

    const testSpecSubmit = useApi(apiActions.testSpecSubmit);

    const testSpecFormSubmit = async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);

        testSpecSubmit.fetch({
            widgetId,
            formData,
        });
    };

    return (
        <Grid container>
            <Grid item xs={12}>
                <TestSpecInputForm onSubmit={testSpecFormSubmit}/>
            </Grid>
            <Grid item xs={12}>
                {testSpecSubmit.error
                    ? <Error error={testSpecSubmit.error}/>
                    : <Tty
                        title={
                            testSpecSubmit.data.compilerResult.exitCode === undefined
                                ? `Не выполнено`
                                : `Код возврата: ${testSpecSubmit.data.compilerResult.exitCode}`
                        }
                        {...testSpecSubmit.data.compilerResult}
                    />
                }
            </Grid>
        </Grid>
    );
};