import React from 'react';
import {render} from 'react-dom';
import "!style-loader!css-loader!bootstrap/dist/css/bootstrap.min.css";
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import {Widget} from '../views/Widget/Widget';
import {WidgetList} from '../views/WidgetList/WidgetList';

render(
    <BrowserRouter basename={process.env.PUBLIC_PATH}>
        <Switch>
            <Route path="/widgets/:widgetId"><Widget/></Route>
            <Route exact path="/"><WidgetList/></Route>
        </Switch>
    </BrowserRouter>
    , document.getElementById('App'));