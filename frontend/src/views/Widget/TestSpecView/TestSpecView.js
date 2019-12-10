import React, {useEffect} from 'react';
import {TestSpec} from '../../../components/TestSpec/TestSpec';
import {useParams} from 'react-router-dom';
import {Loading} from '../../../components/InvalidState/Loading';
import {Error} from '../../../components/InvalidState/Error';
import {useStore} from '../../../store/store';

export default () => {
    const widgetId = useStore(state => state.widgetId);
    const {testSpecId} = useParams();

    const {
        fetch,
        data,
        loading,
        error
    } = useStore(state => state.testSpec);

    useEffect(() =>
            void setTimeout(() => fetch({testSpecId}), 0),
        [testSpecId, widgetId]);

    let child;

    console.log(loading, error, data);

    if(loading)
        child = <Loading/>;
    else if(error)
        child = <Error error={error}/>;
    else
        child = <TestSpec {...data}/>;

    return (child);
};