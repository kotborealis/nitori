import React from 'react';
import {TestSpecInputForm} from '../../../components/TestSpec/TestSpecInputForm';
import {useApiStore} from '../../../store/store';
import Grid from '@material-ui/core/Grid';
import {Loading} from '../../../components/InvalidState/Loading';
import {Error} from '../../../components/InvalidState/Error';
import {TestSpec} from '../../../components/TestSpec/TestSpec';
import {ExecOutput} from '../../../components/ExecOutput/ExecOutput';

export const TestSpecSubmit = () => {
    const testSpecSubmit = useApiStore("testSpecSubmit");

    const onSubmit = event => {
        event.preventDefault();

        const formData = new FormData(event.target);
        testSpecSubmit.fetch({formData});
    };

    let result;

    if(testSpecSubmit.init)
        result = null;
    else if(testSpecSubmit.loading)
        result = <Loading/>;
    else if(testSpecSubmit.error)
        result = <Error error={testSpecSubmit.error}/>;
    else{
        result = <>
            <ExecOutput {...testSpecSubmit.data.compilerResult}/>
            <TestSpec {...testSpecSubmit.data.testSpec}/>
        </>;
    }

    return (
        <Grid container>
            <Grid item xs={12}>
                <TestSpecInputForm
                    {...{onSubmit}}
                    disabled={testSpecSubmit.loading && !testSpecSubmit.init}
                />
            </Grid>
            <Grid item xs={12}>
                {result}
            </Grid>
        </Grid>
    );
};