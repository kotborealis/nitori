import React from 'react';
import {Loading} from '../InvalidState/Loading';
import {Error} from '../InvalidState/Error';
import {TestTarget} from './TestTarget';
import {apiActions} from '../../api/apiActions';
import {useApi} from '../../api/useApi';

export const TestTargetView = ({testTargetId, widgetId}) => {
    const testTarget = useApi(apiActions.testTarget);
    testTarget.useFetch({widgetId, testTargetId})([testTargetId, widgetId]);

    if(testTarget.loading)
        return <Loading/>;
    if(testTarget.error)
        return <Error error={testTarget.error}/>;

    return <TestTarget output={testTarget.data} loading={testTarget.loading}/>;
};