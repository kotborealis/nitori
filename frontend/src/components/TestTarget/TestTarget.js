import React from 'react';
import {ProgressbarStages} from '../ProgressbarStages/ProgressbarStages';
import {TabsControlled} from '../TabsContorlled/TabsControlled';
import {execOutputsToProgressStages} from '../../helpers/execOutputsToProgressStages';
import {Tab} from 'react-bootstrap';
import {ExecOutput} from '../ExecOutput/ExecOutput';
import {formatDistance} from 'date-fns';
import {ru} from 'date-fns/locale';
import {testOutputsToFailedIndex} from '../../helpers/testOutputsToFailedIndex';
import {CodeCpp} from '../CodeCpp/CodeCpp';
import Tabs from 'react-bootstrap/Tabs';

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
                <ProgressbarStages state={progressStages} loading={loading}/>
                <br/>
                <TabsControlled activeKey={activeTab}>
                    <Tab title={"Компиляция"} eventKey={0}>
                        <ExecOutput {...compilerResult}/>
                    </Tab>
                    <Tab title={"Линковка"} eventKey={1}>
                        <ExecOutput {...linkerResult}/>
                    </Tab>
                    <Tab title={"Тестирование"} eventKey={2}>
                        <ExecOutput {...runnerResult}/>
                    </Tab>
                </TabsControlled>
                <br/>
                <Tabs defaultActiveKey={0} id={"source-files-tabs"}>
                    {sourceFiles.map(({name, data}, index) =>
                        <Tab title={name} eventKey={index}>
                            <CodeCpp>{data}</CodeCpp>
                        </Tab>
                    )}
                </Tabs>
            </div>
        );
    };