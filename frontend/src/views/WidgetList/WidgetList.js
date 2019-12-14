import React, {useEffect} from 'react';
import {useApiStore} from '../../store/store';
import {Loading} from '../../components/InvalidState/Loading';
import {Error} from '../../components/InvalidState/Error';
import {WidgetsList} from '../../components/Widgets/WidgetsList';
import {BlockContainer} from '../../components/BlockContainer/BlockContainer';

export const WidgetList = () => {
    const widgets = useApiStore("widgets");
    useEffect(() => void widgets.fetch(), []);

    let child = null;

    if(widgets.loading || widgets.init)
        child = <Loading/>;
    else if(widgets.error)
        child = <Error error={widgets.error}/>;
    else
        child = <WidgetsList widgets={widgets.data}/>;

    return <BlockContainer>
        {child}
    </BlockContainer>;
};