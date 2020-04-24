import React from 'react';
import {Route, Switch, useParams, useRouteMatch} from 'react-router-dom';
import {BlockContainer} from '../../components/BlockContainer/BlockContainer';
import {TestTargetSubmit} from './TestTargetSubmit/TestTargetSubmit';
import Admin from './Admin/Admin';
import TestSpecView from './TestSpecView/TestSpecView';
import {TestTargetView} from './TestTargetView/TestTargetView';
import {AuthBanner} from '../../components/AuthBanner/AuthBanner';
import {TestSpecSubmit} from './TestSpecSubmit/TestSpecSubmit';
import {apiActions} from '../../api/apiActions';
import {useApi} from '../../api/useApi';

export const Widget = () => {
    const {path} = useRouteMatch();
    const {widgetId} = useParams();

    // Fetch data into store:

    // Fetch test specs
    const testSpecs = useApi(apiActions.testSpec);
    testSpecs.useFetch({widgetId})([widgetId]);

    // Fetch user data
    const userData = useApi(apiActions.userData);
    userData.useFetch()([]);

    return (
        <BlockContainer>
            <AuthBanner show={!userData.loading && userData.error}/>
            <Switch>
                <Route exact path={path}>
                    <TestTargetSubmit/>
                </Route>
                <Route path={`${path}/test-targets/:testTargetId`}>
                    <TestTargetView/>
                </Route>
                <Route path={`${path}/test-specs/:testSpecId`}>
                    <TestSpecView/>
                </Route>
                <Route path={`${path}/test-specs-submit/:testSpecId?`}>
                    <TestSpecSubmit/>
                </Route>
                <Route path={`${path}/admin/:adminTab?`}>
                    <Admin/>
                </Route>
            </Switch>
        </BlockContainer>
    );
};