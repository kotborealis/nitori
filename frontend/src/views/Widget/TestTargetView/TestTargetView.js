import React, {useEffect} from 'react';
import {useParams} from 'react-router-dom';
import {useStore} from '../../../store/store';
import {Loading} from '../../../components/InvalidState/Loading';
import {Error} from '../../../components/InvalidState/Error';
import {TestTarget} from '../../../components/TestTarget/TestTarget';
import {BlockContainer} from '../../../components/BlockContainer/BlockContainer';

export const TestTargetView = () => {
    const {testTargetId, widgetId} = useParams();

    const fetchTestTarget = useStore(state => state.testTarget.fetch);
    useEffect(() => void setTimeout(() => fetchTestTarget({testTargetId}), 0),
        [testTargetId, widgetId]);

    const fetchTestSpecs = useStore(state => state.testSpecs.fetch);
    useEffect(() => void setTimeout(fetchTestSpecs, 0),
        [testTargetId, widgetId]);

    const error = useStore(({testTarget: {error: _1}, testSpecs: {error: _2}}) => _1 || _2);
    const loading = useStore(({testTarget: {loading: _1}, testSpecs: {loading: _2}}) => _1 || _2);

    const testTarget = useStore(({testTarget: {data}}) => data);

    const testSpecId = testTarget && testTarget.testSpecId;
    const testSpecRev = testTarget && testTarget.testSpecRev;

    const testSpecLoading = useStore((state => state.testSpec.loading));
    const testSpecFetch = useStore((state => state.testSpec.fetch));
    const testSpec = useStore((state => state.testSpec.data));

    useEffect(() =>
            void (testTarget && testSpecFetch({testSpecId, testSpecRev})),
        [testSpecId, testSpecRev]);

    if(loading || testSpecLoading) return <Loading/>;
    if(error) return <Error error={error}/>;

    return <BlockContainer>
        <TestTarget output={testTarget} testSpec={testSpec} loading={loading}/>
    </BlockContainer>;
};