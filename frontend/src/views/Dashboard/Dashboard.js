import React, {useEffect, useState} from 'react';
import styles from './dashboard.css';
import {TestTargetsList} from '../../components/TestTarget/TestTargetsList';
import {TestSpecsList} from '../../components/TestSpec/TestSpecsList';
import {apiActions} from '../../api/apiActions';
import {useHistory, useParams} from 'react-router-dom';
import {useApi} from '../../api/useApi';
import {NotFound} from '../../components/InvalidState/NotFound';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import {TabPanel} from '../../components/TabPanel/TabPanel';
import {DashboardBar} from '../../components/DashboardBar/DashboardBar';
import TestSpecView from '../../components/TestSpec/TestSpecView';
import {TestTargetView} from '../../components/TestTarget/TestTargetView';
import {TestSpecSubmit} from '../../components/TestSpecSubmit/TestSpecSubmit';

const DashboardBasic = () => {
    const {widgetId, dashboardTab = 'test-specs', itemId} = useParams();
    const widget = useApi(apiActions.widget);
    widget.useFetch({widgetId})([widgetId]);

    const history = useHistory();

    const [tab, setTab] = useState(dashboardTab);
    const handleTabChange = (event, value) => {
        setTab(value);
        history.push(`/dashboard/${widgetId}/${value}`);
    };

    useEffect(() => {
        setTab(dashboardTab);
    }, [dashboardTab]);

    if(widget.error)
        return <NotFound/>;

    if(itemId && dashboardTab === 'test-specs')
        return <TestSpecView widgetId={widgetId} testSpecId={itemId}/>;

    if(itemId && dashboardTab === 'test-targets')
        return <TestTargetView widgetId={widgetId} testTargetId={itemId}/>;

    return <>
        <Paper square>
            <Tabs value={tab} onChange={handleTabChange}>
                <Tab label={"Тесты"} value={"test-specs"}/>
                <Tab label={"Попытки"} value={"test-targets"}/>
                <Tab label={"Новый тест"} value={"test-spec-submit"}/>
            </Tabs>
        </Paper>
        <Paper square>
            <TabPanel value={tab} index={"test-specs"}>
                <TestSpecsList/>
            </TabPanel>
            <TabPanel value={tab} index={"test-targets"}>
                <TestTargetsList/>
            </TabPanel>
            <TabPanel value={tab} index={"test-spec-submit"}>
                <TestSpecSubmit widgetId={widgetId}/>
            </TabPanel>
        </Paper>
    </>;
};

export const Dashboard = () =>
    <div className={styles.root}>
        <DashboardBar/>
        <div className={styles.content}>
            <DashboardBasic/>
        </div>
    </div>;