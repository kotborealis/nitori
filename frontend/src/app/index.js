import React, {useEffect} from 'react';
import {render} from 'react-dom';
import {BrowserRouter, Route, Switch, useParams} from 'react-router-dom';
import {Widget} from '../views/Widget/Widget';
import {WidgetList} from '../views/WidgetList/WidgetList';
import Container from '@material-ui/core/Container';
import {useStore} from '../store/store';

const RouterRoot = ({children}) => {
    return (
        <BrowserRouter basename={process.env.PUBLIC_PATH}>
            <Switch>
                {children}
            </Switch>
        </BrowserRouter>
    );
};

const Routes = () =>
    <Container maxWidth="lg">
        <Route path="/widgets/:widgetId"><RouteWidget/></Route>
        <Route exact path="/"><WidgetList/></Route>
    </Container>;

const RouteWidget = () => {
    const {widgetId} = useParams();
    const setStore = useStore(store => store.set);

    useEffect(() => void setStore(store => void (store.widgetId = widgetId)), [widgetId]);

    return <Widget/>;
};

render(<RouterRoot>
    <Routes/>
</RouterRoot>, document.getElementById('App'));