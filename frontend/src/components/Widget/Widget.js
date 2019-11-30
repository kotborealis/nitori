import React, {useEffect} from 'react';
import {Route, Switch, useParams, useRouteMatch} from 'react-router-dom';
import {useStore} from '../../store/store';
import {BlockContainer} from '../BlockContainer/BlockContainer';
import TestTarget from '../../views/TestTarget/TestTarget';
import Admin from '../../views/Admin/Admin';
import TestSpec from '../../views/TestSpec/TestSpec';

export const Widget = () => {
    const {path} = useRouteMatch();

    const widgetId = useStore(state => state.widgetId);
    const setWidgetId = useStore(state => state.setWidgetId);
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
                    <Route path={`${path}/test-spec/:testSpecId`}>
                        <TestSpec/>
                    </Route>
                </Switch>
            </BlockContainer>
        </>
    );
};