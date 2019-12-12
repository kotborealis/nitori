import React from 'react';
import {TestSpecInputForm} from '../../../components/TestSpec/TestSpecInputForm';
import {useStore} from '../../../store/store';
import {TestSpec} from '../../../components/TestSpec/TestSpec';
import {Loading} from '../../../components/InvalidState/Loading';
import {Error} from '../../../components/InvalidState/Error';
import Grid from '@material-ui/core/Grid';

export const TestSpecSubmit = () => {
    const submitTestSpec = useStore(state => state.testSpecSubmit.fetch);

    const [
        testSpec,
        loading,
        init,
        error
    ] = useStore(({testSpecSubmit: {data, loading, init, error}}) => [data, loading, init, error]);

    const onSubmit = event => {
        event.preventDefault();

        const formData = new FormData(event.target);
        void submitTestSpec({formData});
    };

    let result = null;

    if(init)
        result = null;
    else if(loading)
        result = <Loading/>;
    else if(error)
        result = <Error error={error}/>;
    else
        result = <TestSpec {...testSpec}/>;

    return (
        <Grid container>
            <Grid item xs={12}>
                <TestSpecInputForm
                    {...{onSubmit}}
                    disabled={loading && !init}
                />
                }
            </Grid>
            <Grid item xs={12}>
                {result}
            </Grid>
        </Grid>
    );
};