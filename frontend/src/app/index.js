import React from 'react';
import {render} from 'react-dom';
import {BrowserRouter, matchPath, Route, Switch, withRouter} from 'react-router-dom';
import {Widget} from '../views/Widget/Widget';
import {WidgetList} from '../views/WidgetList/WidgetList';
import Container from '@material-ui/core/Container';

const RouterRoot = ({children}) => {
    return (
        <BrowserRouter basename={process.env.PUBLIC_PATH}>
            <Switch>
                {children}
            </Switch>
        </BrowserRouter>
    );
};

const Routes = () => {
    return (<Container maxWidth="lg">
        <Route path="/widgets/:widgetId"><RouteWidget/></Route>
        <Route exact path="/"><WidgetList/></Route>
    </Container>);
};

const RouteWidget = withRouter(({location: {pathname}}) => {
    return <Widget/>;
});

render(<RouterRoot>
    <Routes/>
</RouterRoot>, document.getElementById('App'));