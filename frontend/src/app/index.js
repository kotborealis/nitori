import React, {useEffect} from 'react';
import {render} from 'react-dom';
import "!style-loader!css-loader!bootstrap/dist/css/bootstrap.min.css";
import {BrowserRouter, Link, Route, Switch, useParams, useRouteMatch} from 'react-router-dom';
import TestTarget from '../views/TestTarget/TestTarget';
import Admin from '../views/Admin/Admin';
import {BlockContainer} from '../components/BlockContainer/BlockContainer';

import {useStoreWidget} from '../store/widget';
import {Jumbotron} from 'react-bootstrap';

const Widget = () => {
    const {path} = useRouteMatch();

    const widgetId = useStoreWidget(state => state.widgetId);
    const setWidgetId = useStoreWidget(state => state.setWidgetId);
    const {widgetId: pathWidgetId} = useParams();
    useEffect(() => setWidgetId(pathWidgetId));

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


render(
    <BrowserRouter basename={process.env.PUBLIC_PATH}>
        <Switch>
            <Route path="/widgets/:widgetId"><Widget/></Route>
            <Route exact path="/">
                <BlockContainer>
                    <Jumbotron>
                        <h1>C++ contest-like system</h1>
                        <p>
                            <Link to="/widgets/0">Default widget</Link>
                        </p>
                    </Jumbotron>
                </BlockContainer>
            </Route>
        </Switch>
    </BrowserRouter>
    , document.getElementById('App'));