import React from 'react';
import {render} from 'react-dom';
import "!style-loader!css-loader!bootstrap/dist/css/bootstrap.min.css";
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import TestTarget from '../views/TestTarget/TestTarget';
import TestSpec from '../views/TestSpec/TestSpec';
import Admin from '../views/Admin/Admin';
import {BlockContainer} from '../components/BlockContainer/BlockContainer';

render(<BlockContainer>
        <BrowserRouter basename={process.env.PUBLIC_PATH}>
            <Switch>
                <Route exact path="/">
                    <TestTarget/>
                </Route>
                <Route exact path="/submitTask">
                    <TestSpec/>
                </Route>
                <Route exact path="/admin">
                    <Admin/>
                </Route>
            </Switch>
        </BrowserRouter>
    </BlockContainer>,
    document.getElementById('App')
);