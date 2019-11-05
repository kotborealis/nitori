import React from 'react';
import {render} from 'react-dom';
import "!style-loader!css-loader!bootstrap/dist/css/bootstrap.min.css";
import {BrowserRouter, Switch, Route, Link} from 'react-router-dom';
import SubmitTest from './views/SubmitTest/SubmitTest';
import SubmitTask from './views/SubmitTask/SubmitTask';

render(
    <BrowserRouter>
        <Switch>
            <Route exact path="/">
                <SubmitTest/>
            </Route>
            <Route exact path="/submitTask">
                <SubmitTask/>
            </Route>
        </Switch>
    </BrowserRouter>,
document.getElementById('App')
);