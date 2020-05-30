import React, {useEffect, useState} from 'react';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import {ExecOutput} from '../ExecOutput/ExecOutput';
import {testOutputsToFailedIndex} from '../../helpers/testOutputsToFailedIndex';
import Paper from '@material-ui/core/Paper';
import {TestTargetStepper} from './TestTargetStepper';
import Grid from '@material-ui/core/Grid';
import {FileViewer} from '../FileViewer/FileViewer';
import {Link} from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import {TimeUpdated} from '../TimeUpdated/TimeUpdated';
import {TabPanel} from '../TabPanel/TabPanel';
import {apiActions} from '../../api/apiActions';
import {useApi} from '../../api/useApi';

export const TestTarget =
    ({
         output: {
             targetCompilerResult = {},
             specCompilerResult = {},
             linkerResult = {},
             runnerResult = {},
             timestamp = 0,
             userData = {},
             sourceFiles = [],
             testSpec: testSpecId = null,
             widget: widgetId = null
         } = {}
     } = {}) => {
        const execOutputs = [targetCompilerResult, specCompilerResult, linkerResult, runnerResult];

        const suggestedResultTab = testOutputsToFailedIndex(execOutputs);
        const [resultTab, setResultTab] = useState(suggestedResultTab);

        const testSpec = useApi(apiActions.testSpec);
        testSpec.useFetch({testSpecId})([testSpecId, widgetId]);

        useEffect(() => {
            if(resultTab !== suggestedResultTab)
                setResultTab(value);
        }, [suggestedResultTab]);

        const handleResultTabChange = (event, value) => setResultTab(value);

        return (
            <Grid container>
                <Grid item xs={12}>
                    <Paper>
                        <Typography variant="body1" style={{padding: '20px'}}>
                            Решение
                            {testSpec.data && <>
                                для задания <Link to={
                                `/dashboard/${testSpec.widgetId}/test-specs/${testSpec._id}`
                            }>{testSpec.name}</Link>,
                            </>} {userData.name} ({userData.login}), {userData.groupName},
                            отправлено <TimeUpdated>{timestamp}</TimeUpdated>
                        </Typography>

                        <TestTargetStepper
                            targetCompilerResult={targetCompilerResult}
                            specCompilerResult={specCompilerResult}
                            linkerResult={linkerResult}
                            runnerResult={runnerResult}
                        />
                    </Paper>
                </Grid>

                <Grid item xs={12}>
                    <Paper square>
                        <Tabs value={resultTab} onChange={handleResultTabChange}>
                            <Tab label={"Компиляция"} id={0}/>
                            <Tab label={"Компиляция теста"} id={0}/>
                            <Tab label={"Линковка"} id={1}/>
                            <Tab label={"Тестирование"} id={2}/>
                        </Tabs>
                    </Paper>

                    <Paper square>
                        <TabPanel value={resultTab} index={0}>
                            <ExecOutput {...targetCompilerResult}/>
                        </TabPanel>
                        <TabPanel value={resultTab} index={1}>
                            <ExecOutput {...specCompilerResult}/>
                        </TabPanel>
                        <TabPanel value={resultTab} index={2}>
                            <ExecOutput {...linkerResult}/>
                        </TabPanel>
                        <TabPanel value={resultTab} index={3}>
                            <ExecOutput {...runnerResult}/>
                        </TabPanel>
                    </Paper>
                </Grid>

                <Grid item xs={12}>
                    <FileViewer files={sourceFiles}/>
                </Grid>
            </Grid>
        );
    };