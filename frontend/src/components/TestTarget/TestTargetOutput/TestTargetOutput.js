import {Tab, Tabs} from 'react-bootstrap';
import {Tty} from '../../Tty/Tty';
import React, {useEffect, useState} from 'react';
import {exitCodeToColor} from '../../../helpers/exitCodeToColor';

export const TestTargetOutput =
    ({
         userData = undefined,
         timestamp = undefined,
         sourceFiles = [],
         compilerResult = {},
         linkerResult = {},
         runnerResult = {}
     } = {}) => {

        const [tab, setTab] = useState('compilation');

        useEffect(() => {
            if(exitCodeToColor(compilerResult.exitCode) === "danger"){
                if(tab !== 'compilation')
                    setTab('compilation');
            }
            else if(exitCodeToColor(linkerResult.exitCode) === "danger"){
                if(tab !== 'linking')
                    setTab('linking');
            }
            else{
                if(tab !== 'testing')
                    setTab('testing');
            }
        }, [compilerResult.exitCode, linkerResult.exitCode, runnerResult.exitCode]);

        return (
            <div>
                <Tabs activeKey={tab} onSelect={setTab} id={"0"}>
                    {userData !== undefined &&
                     <Tab title={"Инфо"} eventKey={"info"}>
                         {userData === null || userData === undefined ? null : <div>
                             <div>{userData.login} ({userData.name}), группа {userData.groupName}</div>
                             <div>{(new Date(timestamp)).toString()}</div>
                         </div>}
                     </Tab>
                    }
                    {sourceFiles !== undefined &&
                     <Tab title={"Исходный код"} eventKey={"sourceFiles"}>
                         {sourceFiles.map(({name, data}) => <div>
                             <b>{name}</b>
                             <pre>{data}</pre>
                         </div>)}
                     </Tab>
                    }
                    {compilerResult !== undefined &&
                     <Tab title={"Компиляция"} eventKey={"compilation"}>
                         <Tty {...compilerResult} title={"Результат компиляции:"}/>
                     </Tab>
                    }
                    {linkerResult !== undefined &&
                     <Tab title={"Компиляция"} eventKey={"compilation"}>
                         <Tty {...compilerResult} title={"Результат компиляции:"}/>
                     </Tab>
                    }
                    {runnerResult !== undefined &&
                     <Tab title={"Тестирование"} eventKey={"testing"}>
                         <Tty {...runnerResult} title={"Результат тестирования:"}/>
                     </Tab>
                    }
                </Tabs>
            </div>
        );
    };