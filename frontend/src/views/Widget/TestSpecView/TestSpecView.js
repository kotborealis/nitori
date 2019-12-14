import React, {useEffect} from 'react';
import {TestSpec} from '../../../components/TestSpec/TestSpec';
import {useParams} from 'react-router-dom';
import {Loading} from '../../../components/InvalidState/Loading';
import {Error} from '../../../components/InvalidState/Error';
import {useApiStore, useStore} from '../../../store/store';

export default () => {
    const widgetId = useStore(state => state.widgetId);
    const {testSpecId, testSpecRev} = useParams();

    const testSpec = useApiStore("testSpec@testSpecView");

    useEffect(() =>
            void setTimeout(() => testSpec.fetch({testSpecId, testSpecRev}), 0),
        [testSpecId, widgetId]);

    let child;

    if(testSpec.loading)
        child = <Loading/>;
    else if(testSpec.error)
        child = <Error error={testSpec.error}/>;
    else
        child = <TestSpec {...testSpec.data}/>;

    return (child);
};