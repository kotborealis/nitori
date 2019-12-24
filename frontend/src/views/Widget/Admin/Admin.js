import React, {useEffect, useState} from 'react';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import {TestSpecsList} from '../../../components/TestSpec/TestSpecsList';
import {TestTargetsList} from '../../../components/TestTarget/TestTargetsList';
import {useApiStore, useStore} from '../../../store/store';
import {Loading} from '../../../components/InvalidState/Loading';
import {Error} from '../../../components/InvalidState/Error';
import {useHistory} from "react-router-dom";
import {TabPanel} from '../../../components/TabPanel/TabPanel';
import {TestSpecSubmit} from '../TestSpecSubmit/TestSpecSubmit';

export default () => {
    const history = useHistory();
    const widgetId = useStore(state => state.widgetId);

    // Fetch test targets
    const testTargets = useApiStore("testTargets");
    useEffect(() => void testTargets.fetch(), [widgetId]);

    const testSpecDelete = useApiStore("testSpecDelete@admin");

    const testSpecs = useApiStore("testSpecs");

    useEffect(() => void testSpecs.fetch(), [testSpecDelete.data]);

    const [tab, setTab] = useState(0);
    const handleTabChange = (event, value) => setTab(value);

    return (<>
        <Paper square>
            <Tabs value={tab} onChange={handleTabChange}>
                <Tab label={"Попытки"} id={0}/>
                <Tab label={"Тесты"} id={1}/>
                <Tab label={"Добавить тест"} id={2}/>
            </Tabs>
        </Paper>
        <Paper square>
            <TabPanel value={tab} index={0}>
                {testTargets.loading && <Loading/>}
                {testTargets.error && <Error error={testTargets.error}/>}
                {!testTargets.loading && !testTargets.error &&
                 <TestTargetsList
                     data={testTargets.data}
                 />}
            </TabPanel>
            <TabPanel value={tab} index={1}>
                {testSpecs.loading && <Loading/>}
                {testSpecs.error && <Error error={testSpecs.error}/>}
                {!testSpecs.loading && !testSpecs.error && <TestSpecsList
                    data={testSpecs.data}
                    onEdit={id => history.push(`/widgets/${widgetId}/test-specs-submit/${id}`)}
                    onDelete={id => testSpecDelete.fetch({testSpecId: id})}
                />}
            </TabPanel>
            <TabPanel value={tab} index={2}>
                <TestSpecSubmit/>
            </TabPanel>
        </Paper>
    </>);
};