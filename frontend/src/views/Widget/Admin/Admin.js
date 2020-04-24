import React, {useState} from 'react';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import {TestSpecsList} from '../../../components/TestSpec/TestSpecsList';
import {TestTargetsList} from '../../../components/TestTarget/TestTargetsList';
import {Loading} from '../../../components/InvalidState/Loading';
import {Error} from '../../../components/InvalidState/Error';
import {useHistory, useParams} from "react-router-dom";
import {TabPanel} from '../../../components/TabPanel/TabPanel';
import {TestSpecSubmit} from '../TestSpecSubmit/TestSpecSubmit';
import {apiActions} from '../../../api/apiActions';
import {useApi} from '../../../api/useApi';

export default () => {
    const history = useHistory();
    const {widgetId} = useParams();

    const testSpecDelete = useApi(apiActions.testSpecDelete);
    const testSpecs = useApi(apiActions.testSpecs);

    testSpecs.useFetch({widgetId})([testSpecDelete.data]);

    const [tab, setTab] = useState("test-targets");
    const handleTabChange = (event, value) => setTab(value);

    return (<>
        <Paper square>
            <Tabs value={tab} onChange={handleTabChange}>
                <Tab label={"Попытки"} value={"test-targets"}/>
                <Tab label={"Тесты"} value={"test-specs"}/>
                <Tab label={"Добавить тест"} value={"test-specs-submit"}/>
            </Tabs>
        </Paper>
        <Paper square>
            <TabPanel value={tab} index={"test-targets"}>
                <TestTargetsList/>
            </TabPanel>
            <TabPanel value={tab} index={"test-specs"}>
                {testSpecs.loading && <Loading/>}
                {testSpecs.error && <Error error={testSpecs.error}/>}
                {!testSpecs.loading && !testSpecs.error && <TestSpecsList
                    data={testSpecs.data}
                    onEdit={id => history.push(`/widgets/${widgetId}/test-specs-submit/${id}`)}
                    onDelete={id => testSpecDelete.fetch({testSpecId: id})}
                />}
            </TabPanel>
            <TabPanel value={tab} index={"test-specs-submit"}>
                <TestSpecSubmit/>
            </TabPanel>
        </Paper>
    </>);
};