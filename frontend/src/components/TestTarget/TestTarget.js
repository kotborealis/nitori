import React, {useEffect, useState} from 'react';
import {execOutputsToProgressStages} from '../../helpers/execOutputsToProgressStages';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import {ExecOutput} from '../ExecOutput/ExecOutput';
import {formatDistance} from 'date-fns';
import {ru} from 'date-fns/locale';
import {testOutputsToFailedIndex} from '../../helpers/testOutputsToFailedIndex';
import {CodeCpp} from '../CodeCpp/CodeCpp';
import AttachmentIcon from '@material-ui/icons/Attachment';
import Paper from '@material-ui/core/Paper';
import {TestTargetStepper} from './TestTargetStepper';

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

        const progressStages = execOutputsToProgressStages(execOutputs);
        const activeTab = testOutputsToFailedIndex(execOutputs);

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
            <div>
                <div>
                    <p>
                        Решение для <a href={
                        `/widgets/${testSpec.widgetId}/test-specs/${testSpec._id}/`
                    }>{testSpec.name}</a>,
                        от пользователя {userData.name} ({userData.login}), {userData.groupName},
                        отправлено {formatDistance(new Date(timestamp), new Date, {locale: ru})} назад
                    </p>
                </div>
                <br/>

                <TestTargetStepper
                    compilerResult={compilerResult}
                    linkerResult={linkerResult}
                    runnerResult={runnerResult}
                />

                <br/>

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

                <br/>

                <Paper square>
                    <Tabs value={sourceCodeTab} onChange={handleSourceCodeTabChange}>
                        {sourceFiles.map(({name}, index) =>
                            <Tab label={name} id={index} icon={<AttachmentIcon/>}/>
                        )}
                    </Tabs>
                </Paper>

                {sourceFiles.map(({data}, index) =>
                    <TabPanel value={sourceCodeTab} index={index}>
                        <CodeCpp>{data}</CodeCpp>
                    </TabPanel>
                )}
            </div>
        );
    };