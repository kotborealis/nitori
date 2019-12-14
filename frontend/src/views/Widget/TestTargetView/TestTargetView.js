import React, {useEffect} from 'react';
import {useParams} from 'react-router-dom';
import {useApiStore, useStore} from '../../../store/store';
import {Loading} from '../../../components/InvalidState/Loading';
import {Error} from '../../../components/InvalidState/Error';
import {TestTarget} from '../../../components/TestTarget/TestTarget';
import {BlockContainer} from '../../../components/BlockContainer/BlockContainer';

export const TestTargetView = () => {
    const {testTargetId} = useParams();
    const widgetId = useStore(state => state.widgetId);

    const testTarget = useApiStore("testTarget@testTargetView");
    useEffect(() => void setTimeout(() => testTarget.fetch({testTargetId}), 0),
        [testTargetId, widgetId]);

    if(testTarget.loading) return <Loading/>;
    if(testTarget.error) return <Error error={testTarget.error}/>;

    return <BlockContainer>
        <TestTarget output={testTarget.data} loading={testTarget.loading}/>
    </BlockContainer>;
};