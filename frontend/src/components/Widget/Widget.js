import React, {useEffect} from 'react';
import {Route, Switch, useParams, useRouteMatch} from 'react-router-dom';
import {useStoreWidget} from '../../store/widget';
import {BlockContainer} from '../BlockContainer/BlockContainer';
import TestTarget from '../../views/TestTarget/TestTarget';
import Admin from '../../views/Admin/Admin';

export const Widget = () => {
    const {path} = useRouteMatch();

    const widgetId = useStoreWidget(state => state.widgetId);
    const setWidgetId = useStoreWidget(state => state.setWidgetId);
    const {widgetId: pathWidgetId} = useParams();
    useEffect(() => setWidgetId(pathWidgetId), [pathWidgetId]);

    return (
        <>
            <BlockContainer>
                <Switch>
                    <Route exact path={path}>
                        <TestTarget/>
                    </Route>
                    <Route path={`${path}/admin`}>
                        <Admin/>
                    </Route>
                </Switch>
            </BlockContainer>
        </>
    );
};