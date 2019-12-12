import React, {useEffect} from 'react';
import {useParams} from 'react-router-dom';
import {useStore} from '../../../store/store';
import {Loading} from '../../../components/InvalidState/Loading';
import {Error} from '../../../components/InvalidState/Error';
import {TestTarget} from '../../../components/TestTarget/TestTarget';
import {BlockContainer} from '../../../components/BlockContainer/BlockContainer';

export const TestTargetView = () => {
    const {testTargetId} = useParams();
    const widgetId = useStore(state => state.widgetId);

    const fetchTestTarget = useStore(state => state.testTarget.fetch);
    useEffect(() => void setTimeout(() => fetchTestTarget({testTargetId}), 0),
        [testTargetId, widgetId]);

    const [testTarget, error, loading] = useStore(({testTarget: {data, error, loading}}) => [data, error, loading]);

    if(loading) return <Loading/>;
    if(error) return <Error error={error}/>;

    return <BlockContainer>
        <TestTarget output={testTarget} loading={loading}/>
    </BlockContainer>;
};