import React from 'react';
import {TestSpec} from './TestSpec';
import {Loading} from '../InvalidState/Loading';
import {Error} from '../InvalidState/Error';
import {apiActions} from '../../api/apiActions';
import {useApi} from '../../api/useApi';

export default ({testSpecId, widgetId}) => {
    const testSpec = useApi(apiActions.testSpec);
    testSpec.useFetch({widgetId, testSpecId})([testSpecId, widgetId]);

    if(testSpec.loading)
        return <Loading/>;

    if(testSpec.error)
        return <Error error={testSpec.error}/>;

    return <TestSpec {...testSpec.data}/>;
};