import React from 'react';
import {Loading} from '../../components/InvalidState/Loading';
import {Error} from '../../components/InvalidState/Error';
import {WidgetsList} from '../../components/Widgets/WidgetsList';
import {BlockContainer} from '../../components/BlockContainer/BlockContainer';
import {useApi} from '../../api/useApi';
import {apiActions} from '../../api/apiActions';

export const WidgetList = () => {
    const widgets = useApi(apiActions.widgets);
    widgets.useFetch()([]);

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