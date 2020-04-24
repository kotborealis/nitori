import React from 'react';
import {useParams} from 'react-router-dom';
import {Loading} from '../../../components/InvalidState/Loading';
import {Error} from '../../../components/InvalidState/Error';
import {TestTarget} from '../../../components/TestTarget/TestTarget';
import {BlockContainer} from '../../../components/BlockContainer/BlockContainer';
import {apiActions} from '../../../api/apiActions';
import {useApi} from '../../../api/useApi';

export const TestTargetView = () => {
    const {testTargetId} = useParams();
    const {widgetId} = useParams();

    const testTarget = useApi(apiActions.testTarget);
    testTarget.useFetch({widgetId, testTargetId})([testTargetId, widgetId]);

    if(testTarget.loading) return <Loading/>;
    if(testTarget.error) return <Error error={testTarget.error}/>;

    return <BlockContainer>
        <TestTarget output={testTarget.data} loading={testTarget.loading}/>
    </BlockContainer>;
};