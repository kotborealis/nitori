import React from 'react';
import {render} from 'react-dom';
import "!style-loader!css-loader!bootstrap/dist/css/bootstrap.min.css";
import {BrowserRouter, Link, Route, Switch} from 'react-router-dom';
import {BlockContainer} from '../components/BlockContainer/BlockContainer';
import {Jumbotron} from 'react-bootstrap';
import {Widget} from '../components/Widget/Widget';

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