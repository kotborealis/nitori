import React, {useRef, useState} from 'react';
import {useHistory, useParams} from 'react-router-dom';
import {apiActions} from '../../api/apiActions';
import {testTargetLastStageBadge} from './testTargetResultBadges';
import {useApi} from '../../api/useApi';
import {Link} from 'react-router-dom';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Paper from '@material-ui/core/Paper/Paper';
import {TabPanel} from '../TabPanel/TabPanel';
import MaterialTable from 'material-table';
import styles from './testTargetListGrouped.css';
import Typography from '@material-ui/core/Typography';

function testSpecOverview(widgetId, testSpecId, testTargetsByTestSpec) {
    const targets = testTargetsByTestSpec
        .find(({testSpec}) => testSpec._id === testSpecId)?.testTargets;

    if(!targets) return null;

    const solution = targets.find(target => target.runnerResult?.exitCode === 0);
    const badge = testTargetLastStageBadge(solution || targets[0]);

    return <Link href={`/dashboard/${widgetId}/test-targets/${(solution || targets[0])._id}`}
                 rel="noopener noreferrer"
                 target="_blank" className={styles.targetBadgeLink}>
        {badge}
    </Link>;
}

function usersList(widgetId, testTargetsGrouped, testSpecs, users) {
    const loading = testSpecs.loading || testTargetsGrouped.loading;
    return <MaterialTable
        options={{
            showTitle: false,
            search: false,
            paging: false,
            headerStyle: {position: 'sticky', top: 0},
            maxBodyHeight: '650px'
        }}

        isLoading={loading}

        columns={[
            {
                title: 'Пользователь',
                render: ({userData: {name, login}}) => <Typography>{name ? `${name} (${login})` : login}</Typography>,
                sorting: false,
                width: 300,
                cellStyle: {position: 'sticky', left: 0, background: 'white'},
                headerStyle: {position: 'sticky', left: 0, zIndex: 999}
            },
            ...(loading ? [] : testSpecs.data?.map(({name, _id}) => ({
                title: name,
                render: ({testTargetsByTestSpec}) => testSpecOverview(widgetId, _id, testTargetsByTestSpec),
                sorting: false,
                cellStyle: {border: `1px solid rgba(0, 0, 0, 0.1)`},
                width: 200
            })))
        ]}

        data={users}/>;
}

function groupsListTabs(testTargetsGrouped) {
    return testTargetsGrouped.data?.map(({group}) =>
        <Tab label={group.trim() ? group : '(без названия)'} value={group}/>
    );
}

function groupsListPanels(widgetId, currentTab, testSpecs, testTargetsGrouped) {
    return testTargetsGrouped.data?.map(({group, users}) =>
        <TabPanel value={currentTab} index={group}>
            {usersList(widgetId, testTargetsGrouped, testSpecs, users)}
        </TabPanel>
    );
}

export const TestTargetsListGrouped = () => {
    const history = useHistory();
    const {widgetId} = useParams();
    const tableRef = useRef(null);

    const testTargetsGrouped = useApi(apiActions.testTargetsByGroupByUsersByTestSpecs);
    testTargetsGrouped.useFetch({widgetId})([widgetId]);

    const testSpecs = useApi(apiActions.testSpecs);
    testSpecs.useFetch({widgetId})([widgetId]);

    const [tab, setTab] = useState(``);
    const handleTabChange = (event, value) => setTab(value);

    return (
        <>
            <Paper square>
                <Tabs value={tab} onChange={handleTabChange}>
                    {groupsListTabs(testTargetsGrouped)}
                </Tabs>
            </Paper>
            <Paper square>
                {groupsListPanels(widgetId, tab, testSpecs, testTargetsGrouped)}
            </Paper>
        </>
    );
};