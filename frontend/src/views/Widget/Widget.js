import React, {useEffect} from 'react';
import {Route, Switch, useRouteMatch} from 'react-router-dom';
import {BlockContainer} from '../../components/BlockContainer/BlockContainer';
import {TestTargetSubmit} from './TestTargetSubmit/TestTargetSubmit';
import Admin from './Admin/Admin';
import TestSpecView from './TestSpecView/TestSpecView';
import {useApiStore, useStore} from '../../store/store';
import {TestTargetView} from './TestTargetView/TestTargetView';
import {AuthBanner} from '../../components/AuthBanner/AuthBanner';
import {TestSpecSubmit} from './TestSpecSubmit/TestSpecSubmit';

export const Widget = () => {
    const {path} = useRouteMatch();
    const widgetId = useStore(state => state.widgetId);

    // Fetch data into store:

    // Fetch test specs
    const testSpecs = useApiStore("testSpecs");
    useEffect(() => void setTimeout(testSpecs.fetch, 0), [widgetId]);

    // Fetch user data
    const userData = useApiStore("userData");
    useEffect(() => void userData.fetch(), []);

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
                <Route path={`${path}/test-targets`}>
                    <TestTargetSubmit/>
                </Route>
                <Route path={`${path}/test-specs/:testSpecId/:testSpecRev?`}>
                    <TestSpecView/>
                </Route>
                <Route path={`${path}/test-specs`}>
                    <TestSpecSubmit/>
                </Route>
                <Route path={`${path}/admin`}>
                    <Admin/>
                </Route>
            </Switch>
        </BlockContainer>
    );
};