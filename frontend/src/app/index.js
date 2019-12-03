import React from 'react';
import {render} from 'react-dom';
import "!style-loader!css-loader!bootstrap/dist/css/bootstrap.min.css";
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import {Widget} from '../views/Widget/Widget';
import {WidgetList} from '../views/WidgetList/WidgetList';
import Container from '@material-ui/core/Container';

render(
    <BrowserRouter basename={process.env.PUBLIC_PATH}>
        <Switch>
            <Container maxWidth="lg">
                <Route path="/widgets/:widgetId"><Widget/></Route>
                <Route exact path="/"><WidgetList/></Route>
            </Container>
        </Switch>
    </BrowserRouter>
    , document.getElementById('App'));