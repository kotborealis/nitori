import React, {useEffect} from 'react';
import {Route, Switch, useParams, useRouteMatch} from 'react-router-dom';
import {BlockContainer} from '../../components/BlockContainer/BlockContainer';
import {TestTargetSubmit} from './TestTargetSubmit/TestTargetSubmit';
import Admin from './Admin/Admin';
import TestSpecView from './TestSpecView/TestSpecView';
import {useStore} from '../../store/store';
import {TestTargetView} from './TestTargetView/TestTargetView';
import {AuthBanner} from '../../components/AuthBanner/AuthBanner';

export const Widget = () => {
    const {path} = useRouteMatch();
    const {widgetId} = useParams();

    // Fetch data into store:

    // Fetch test specs
    const fetchTestSpecs = useStore(({testSpecs: {fetch}}) => fetch);
    useEffect(() => void fetchTestSpecs([widgetId]), [widgetId]);

    // Fetch user data
    const fetchUserData = useStore(({userData: {fetch}}) => fetch);
    useEffect(() => void fetchUserData(), []);

    const [userDataLoading, userDataError] = useStore(({userData: {loading, error}}) => [loading, error]);

    return (
        <BlockContainer>
            <AuthBanner show={true || !userDataLoading && userDataError}/>
            <Switch>
                <Route exact path={path}>
                    <TestTargetSubmit/>
                </Route>
                <Route path={`${path}/admin`}>
                    <Admin/>
                </Route>
                <Route path={`${path}/test-specs/:testSpecId`}>
                    <TestSpecView/>
                </Route>
                <Route path={`${path}/test-targets/:testTargetId`}>
                    <TestTargetView/>
                </Route>
            </Switch>
        </BlockContainer>
    );
};