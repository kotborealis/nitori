import React, {useEffect} from 'react';
import {TestSpecInputForm} from '../../../components/TestSpec/TestSpecInputForm';
import Grid from '@material-ui/core/Grid';
import {Loading} from '../../../components/InvalidState/Loading';
import {Error} from '../../../components/InvalidState/Error';
import {TestSpec} from '../../../components/TestSpec/TestSpec';
import {ExecOutput} from '../../../components/ExecOutput/ExecOutput';
import {useParams} from 'react-router-dom';
import {apiActions} from '../../../api/apiActions';
import {useApi} from '../../../api/useApi';

export const TestSpecSubmit = () => {
    const {widgetId, testSpecId} = useParams();
    const testSpecSubmit = useApi(apiActions.testSpecSubmit);
    const testSpec = useApi(apiActions.testSpec);

    useEffect(() => {
        if(testSpecId){
            testSpec.fetch({widgetId, testSpecId});
        }
    }, [testSpecId]);

    const onSubmit = event => {
        event.preventDefault();

        const formData = new FormData(event.target);
        testSpecSubmit.fetch({widgetId, formData, testSpecId});
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

    let form = null;

    if(!testSpecId)
        form = <TestSpecInputForm
            {...{onSubmit}}
            disabled={testSpecSubmit.loading && !testSpecSubmit.init}
        />;
    else if(testSpec.loading)
        form = <Loading/>;
    else if(testSpec.error)
        form = <Error error={testSpec.error}/>;
    else
        form = <TestSpecInputForm
            {...{onSubmit}}
            name={testSpec.data && testSpec.data.name}
            description={testSpec.data && testSpec.data.description}
            disabled={testSpecSubmit.loading && !testSpecSubmit.init}
        />;

    return (
        <Grid container>
            <Grid item xs={12}>
                {form}
            </Grid>
            <Grid item xs={12}>
                {result}
            </Grid>
        </Grid>
    );
};