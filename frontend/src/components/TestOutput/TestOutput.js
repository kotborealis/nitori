import {Tab, Tabs} from 'react-bootstrap';
import OutputRenderer from '../OutputRenderer/OutputRenderer';
import React, {useEffect, useState} from 'react';

export const TestOutput = ({
                               userData = undefined,
                               timestamp = undefined,
                               sourceFiles = [],
                               compilerResult = {},
                               linkerResult = {},
                               runnerResult = {}
                           } = {}) => {

    const exitCodeToAlertVariant = (code) => {
        if(code === 0) return 'success';
        if(code === undefined) return 'light';
        return 'danger';
    };

    const [tab, setTab] = useState('compilation');

    useEffect(() => {
        if(exitCodeToAlertVariant(compilerResult.exitCode) === "danger"){
            if(tab !== 'compilation')
                setTab('compilation');
        }
        else if(exitCodeToAlertVariant(linkerResult.exitCode) === "danger"){
            if(tab !== 'linking')
                setTab('linking');
        }
        else{
            if(tab !== 'testing')
                setTab('testing');
        }
    }, [compilerResult.exitCode, linkerResult.exitCode, runnerResult.exitCode]);

    return (<div>
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
                    <OutputRenderer {...compilerResult} title={"Результат компиляции:"}/>
                </Tab>
            }
            {linkerResult !== undefined &&
                <Tab title={"Линковка"} eventKey={"linking"}>
                    <OutputRenderer {...linkerResult} title={"Результат линковки:"}/>
                </Tab>
            }
            {runnerResult !== undefined &&
                <Tab title={"Тестирование"} eventKey={"testing"}>
                    <OutputRenderer {...runnerResult} title={"Результат тестирования:"}/>
                </Tab>
            }
        </Tabs>
    </div>);
};