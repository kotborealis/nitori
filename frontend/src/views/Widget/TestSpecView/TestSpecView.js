import React from 'react';
import {TestSpec} from '../../../components/TestSpec/TestSpec';
import {useParams} from 'react-router-dom';
import {Loading} from '../../../components/InvalidState/Loading';
import {Error} from '../../../components/InvalidState/Error';
import {apiActions} from '../../../api/apiActions';
import {useApi} from '../../../api/useApi';

export default () => {
    const {widgetId} = useParams();
    const {testSpecId} = useParams();

    const testSpec = useApi(apiActions.testSpec);

    testSpec.useFetch({widgetId, testSpecId})([testSpecId, widgetId]);

    let child;

    if(testSpec.loading)
        child = <Loading/>;
    else if(testSpec.error)
        child = <Error error={testSpec.error}/>;
    else
        child = <TestSpec {...testSpec.data}/>;

    return (child);
};