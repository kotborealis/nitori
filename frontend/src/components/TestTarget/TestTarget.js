import React, {useEffect, useState} from 'react';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import {ExecOutput} from '../ExecOutput/ExecOutput';
import {formatDistance} from 'date-fns';
import {ru} from 'date-fns/locale';
import {testOutputsToFailedIndex} from '../../helpers/testOutputsToFailedIndex';
import Paper from '@material-ui/core/Paper';
import {TestTargetStepper} from './TestTargetStepper';
import Grid from '@material-ui/core/Grid';
import {FileViewer} from '../FileViewer/FileViewer';
import {Link} from 'react-router-dom';
import Typography from '@material-ui/core/Typography';

const TabPanel = ({children, value, index}) => value === index && <div>{children}</div>;

export const TestTarget =
    ({
         output: {
             compilerResult = {},
             linkerResult = {},
             runnerResult = {},
             timestamp = 0,
             userData = {},
             sourceFiles = [],
         } = {},
         testSpec = {},
         loading = false
     } = {}) => {
        const execOutputs = [compilerResult, linkerResult, runnerResult];

        const suggestedResultTab = testOutputsToFailedIndex(execOutputs);
        const [resultTab, setResultTab] = useState(suggestedResultTab);

        useEffect(() => {
            if(resultTab !== suggestedResultTab)
                setResultTab(value);
        }, [suggestedResultTab]);

        const handleResultTabChange = (event, value) => setResultTab(value);

        const [sourceCodeTab, setSourceCodeTab] = useState(0);
        const handleSourceCodeTabChange = (event, value) => setSourceCodeTab(value);

        const stepperIndex = testOutputsToFailedIndex(execOutputs);

        return (
            <Grid container>
                <Grid item xs={12}>
                    <Paper>
                        <Typography variant="body1" style={{padding: '20px'}}>
                            Решение для <Link to={
                            `/widgets/${testSpec.widgetId}/test-specs/${testSpec._id}/`
                        }>{testSpec.name}</Link>,
                            от пользователя {userData.name} ({userData.login}), {userData.groupName},
                            отправлено {formatDistance(new Date(timestamp), new Date, {locale: ru})} назад
                        </Typography>

                        <TestTargetStepper
                            compilerResult={compilerResult}
                            linkerResult={linkerResult}
                            runnerResult={runnerResult}
                        />
                    </Paper>
                </Grid>

                <Grid item xs={12}>
                    <Paper square>
                        <Tabs value={resultTab} onChange={handleResultTabChange}>
                            <Tab label={"Компиляция"} id={0}/>
                            <Tab label={"Линковка"} id={1}/>
                            <Tab label={"Тестирование"} id={2}/>
                        </Tabs>
                    </Paper>

                    <Paper square>
                        <TabPanel value={resultTab} index={0}>
                            <ExecOutput {...compilerResult}/>
                        </TabPanel>
                        <TabPanel value={resultTab} index={1}>
                            <ExecOutput {...linkerResult}/>
                        </TabPanel>
                        <TabPanel value={resultTab} index={2}>
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