import React from 'react';
import {Loading} from '../InvalidState/Loading';
import {Error} from '../InvalidState/Error';
import {apiActions} from '../../api/apiActions';
import {useApi} from '../../api/useApi';
import {TestSpecEdit} from './TestSpecEdit';

export default ({testSpecId = false, widgetId}) => {
    if(!testSpecId)
        return <TestSpecEdit widgetId={widgetId}/>;

    const testSpec = useApi(apiActions.testSpec);
    testSpec.useFetch({widgetId, testSpecId})([testSpecId, widgetId]);

    if(testSpec.loading)
        return <Loading/>;

    if(testSpec.error)
        return <Error error={testSpec.error}/>;

    return <TestSpecEdit widgetId={widgetId} {...testSpec.data}/>;
};