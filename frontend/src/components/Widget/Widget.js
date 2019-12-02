import React, {useEffect} from 'react';
import {Route, Switch, useParams, useRouteMatch} from 'react-router-dom';
import {BlockContainer} from '../BlockContainer/BlockContainer';
import TestTargetSubmit from '../../views/Widget/TestTargetSubmit/TestTargetSubmit';
import Admin from '../../views/Widget/Admin/Admin';
import TestSpec from '../../views/Widget/TestSpec/TestSpec';
import {useStore} from '../../store/store';

export const Widget = () => {
    const {path} = useRouteMatch();
    const {widgetId} = useParams();

    // Fetch data into store:

    // Fetch test specs
    const fetchTestSpecs = useStore(({testSpecs: {fetch}}) => fetch);
    useEffect(() => void fetchTestSpecs(widgetId), [widgetId]);

    // Fetch test targets
    const fetchTestTargets = useStore(({testTargets: {fetch}}) => fetch);
    useEffect(() => void fetchTestTargets(widgetId), [widgetId]);

    // Fetch user data
    const fetchUserData = useStore(({userData: {fetch}}) => fetch);
    useEffect(() => void fetchUserData(), []);

    return (
        <BlockContainer>
            <Switch>
                <Route exact path={path}>
                    <TestTargetSubmit/>
                </Route>
                <Route path={`${path}/admin`}>
                    <Admin/>
                </Route>
                <Route path={`${path}/test-specs/:testSpecId`}>
                    <TestSpec/>
                </Route>
            </Switch>
        </BlockContainer>
    );
};