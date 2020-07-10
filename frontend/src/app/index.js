import React from 'react';
import {render} from 'react-dom';
import {BrowserRouter, matchPath, Redirect, Route, Switch} from 'react-router-dom';
import {Dashboard} from '../views/Dashboard/Dashboard';
import {WidgetSearch} from '../views/WidgetSearch/WidgetSearch';
import './index.css';
import {NotFound} from '../components/InvalidState/NotFound';
import {useApi} from '../api/useApi';
import {apiActions} from '../api/apiActions';
import {AuthBanner} from '../components/AuthBanner/AuthBanner';
import Container from '@material-ui/core/Container';
import {Submit} from '../views/Submit/Submit';

import '../metrics/metrics';

const RouterRoot = ({children}) => {
    // Fetch user data
    const userData = useApi(apiActions.userData);
    userData.useFetch()([]);

    return (
        <BrowserRouter basename={process.env.PUBLIC_PATH}>
            <div>
                <Container max="xs">
                    <AuthBanner show={!userData.loading && userData.error}/>
                    <Switch>
                        <Route exact path="/"><WidgetSearch/></Route>
                        <Route path="/dashboard/:widgetId/:dashboardTab?/:itemId?"><Dashboard/></Route>
                        <Route path="/submit/:widgetId"><Submit/></Route>
                        <Route path="/404"><NotFound/></Route>
                        <Redirect to="/404"/>
                    </Switch>
                </Container>
            </div>
        </BrowserRouter>
    );
};


render(<RouterRoot/>, document.getElementById('App'));