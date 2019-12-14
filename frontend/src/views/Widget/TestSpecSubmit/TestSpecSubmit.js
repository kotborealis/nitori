import React, {useEffect} from 'react';
import {TestSpecInputForm} from '../../../components/TestSpec/TestSpecInputForm';
import {useApiStore} from '../../../store/store';
import Grid from '@material-ui/core/Grid';
import {Loading} from '../../../components/InvalidState/Loading';
import {Error} from '../../../components/InvalidState/Error';
import {TestSpec} from '../../../components/TestSpec/TestSpec';
import {ExecOutput} from '../../../components/ExecOutput/ExecOutput';
import {useParams} from 'react-router-dom';

export const TestSpecSubmit = () => {
    const {testSpecId} = useParams();
    const testSpecSubmit = useApiStore("testSpecSubmit");
    const testSpec = useApiStore("testSpec@testSpecSubmit");

    useEffect(() => {
        if(testSpecId){
            testSpec.fetch({testSpecId});
        }
    }, [testSpecId]);

    const onSubmit = event => {
        event.preventDefault();

        const formData = new FormData(event.target);
        testSpecSubmit.fetch({formData, testSpecId});
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
                {testSpecId && testSpec.loading && <Loading/>}
                {testSpecId && testSpec.data && <TestSpecInputForm
                    {...{onSubmit}}
                    name={testSpec.data && testSpec.data.name}
                    description={testSpec.data && testSpec.data.description}
                    disabled={testSpecSubmit.loading && !testSpecSubmit.init}
                />}
            </Grid>
            <Grid item xs={12}>
                {result}
            </Grid>
        </Grid>
    );
};