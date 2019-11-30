import React, {useEffect} from 'react';
import {render} from 'react-dom';
import "!style-loader!css-loader!bootstrap/dist/css/bootstrap.min.css";
import {BrowserRouter, Route, Switch, useParams} from 'react-router-dom';
import TestTarget from '../views/TestTarget/TestTarget';
import TestSpec from '../views/TestSpec/TestSpec';
import Admin from '../views/Admin/Admin';
import {BlockContainer} from '../components/BlockContainer/BlockContainer';

import {useStoreWidget} from '../store/widget';

const Widget = () => {
    const widgetId = useStoreWidget(state => state.widgetId);
    const setWidgetId = useStoreWidget(state => state.setWidgetId);
    const {widgetId: pathWidgetId} = useParams();
    useEffect(() => setWidgetId(pathWidgetId));

    return (
        <>
            <BlockContainer>
                <Switch>
                    <Route path="/">
                        <TestTarget/>
                    </Route>
                    <Route path="/submitTask">
                        <TestSpec/>
                    </Route>
                    <Route path="/admin">
                        <Admin/>
                    </Route>
                </Switch>
            </BlockContainer>
        </>
    );
};


render(
    <BrowserRouter basename={process.env.PUBLIC_PATH}>
        <Switch>
            <Route path="/widgets/:widgetId"><Widget/></Route>
            <Route path="/">.</Route>
        </Switch>
    </BrowserRouter>
    , document.getElementById('App'));