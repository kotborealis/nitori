import React, {useEffect} from 'react';
import {useParams} from 'react-router-dom';
import {useStore} from '../../../store/store';
import {Loading} from '../../../components/InvalidState/Loading';
import {Error} from '../../../components/InvalidState/Error';
import {TestTarget} from '../../../components/TestTarget/TestTarget';
import {BlockContainer} from '../../../components/BlockContainer/BlockContainer';

export const TestTargetView = () => {
    const {testTargetId, widgetId} = useParams();

    const fetch = useStore(({testTarget: {fetch}}) => fetch);
    useEffect(() => void fetch([widgetId, testTargetId]), [testTargetId, widgetId]);

    const error = useStore(({testTarget: {error: _1}, testSpecs: {error: _2}}) => _1 || _2);
    const loading = useStore(({testTarget: {loading: _1}, testSpecs: {loading: _2}}) => _1 || _2);

    const testTarget = useStore(({testTarget: {data}}) => data);

    const testSpecId = testTarget && testTarget.testSpecId;

    const testSpec = useStore(({testSpecs: {data}}) => data.find(({_id}) => _id === testSpecId));

    if(testTarget === undefined) return null;
    if(loading) return <Loading/>;
    if(error) return <Error error={error}/>;
    if(!testTarget) return <Error error={{message: "Specified resource not found"}}/>;

    return <BlockContainer>
        <TestTarget output={testTarget} testSpec={testSpec} loading={loading}/>
    </BlockContainer>;
};