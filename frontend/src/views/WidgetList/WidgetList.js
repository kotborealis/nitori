import React, {useEffect} from 'react';
import {useStore} from '../../store/store';
import {Loading} from '../../components/InvalidState/Loading';
import {Error} from '../../components/InvalidState/Error';
import {WidgetsList} from '../../components/Widgets/WidgetsList';
import {BlockContainer} from '../../components/BlockContainer/BlockContainer';

export const WidgetList = () => {
    const fetchWidgets = useStore(({widgets: {fetch}}) => fetch);
    useEffect(() => void fetchWidgets(), []);

    const [
        widgets,
        loading,
        error,
        init
    ] = useStore(({widgets: {data, loading, error, init}}) => [data, loading, error, init]);

    let child = null;

    if(loading || init)
        child = <Loading/>;
    else if(error)
        child = <Error error={error}/>;
    else
        child = <WidgetsList widgets={widgets}/>;

    return <BlockContainer>
        {child}
    </BlockContainer>;
};