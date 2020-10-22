import React, {useEffect, useState} from 'react';
import styles from './dashboard.css';
import {TestTargetsList} from '../../components/TestTarget/TestTargetsList';
import {TestSpecsList} from '../../components/TestSpec/TestSpecsList';
import {apiActions} from '../../api/apiActions';
import {Link, useHistory, useParams} from 'react-router-dom';
import {useApi} from '../../api/useApi';
import {NotFound} from '../../components/InvalidState/NotFound';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import {TabPanel} from '../../components/TabPanel/TabPanel';
import {DashboardBar} from '../../components/DashboardBar/DashboardBar';
import {TestTargetView} from '../../components/TestTarget/TestTargetView';
import {TestSpecEdit} from '../../components/TestSpec/TestSpecEdit';
import TestSpec from '../../components/TestSpec/TestSpec';
import Typography from '@material-ui/core/Typography';
import {TestTargetsListGrouped} from '../../components/TestTarget/TestTargetsListGrouped';

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
        return <TestSpec widgetId={widgetId} testSpecId={itemId}/>;

    if(itemId && dashboardTab === 'test-targets')
        return <TestTargetView widgetId={widgetId} testTargetId={itemId}/>;

    return <>
        <Paper elevation={3} style={{padding: 10}}>
            <Typography>
                <Link to={`/submit/${widgetId}`}>Отправка решений</Link>
            </Typography>
        </Paper>
        <Paper square>
            <Tabs value={tab} onChange={handleTabChange}>
                <Tab label={"Задания"} value={"test-specs"}/>
                <Tab label={"Решения"} value={"test-targets"}/>
                <Tab label={"Решения (по группам)"} value={"test-targets-grouped"}/>
                <Tab label={"Добавить задание"} value={"test-spec-submit"}/>
            </Tabs>
        </Paper>
        <Paper square>
            <TabPanel value={tab} index={"test-specs"}>
                <TestSpecsList/>
            </TabPanel>
            <TabPanel value={tab} index={"test-targets"}>
                <TestTargetsList/>
            </TabPanel>
            <TabPanel value={tab} index={"test-targets-grouped"}>
                <TestTargetsListGrouped widgetId={widgetId}/>
            </TabPanel>
            <TabPanel value={tab} index={"test-spec-submit"}>
                <TestSpecEdit widgetId={widgetId}/>
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