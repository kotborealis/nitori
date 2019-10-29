import {Tab, Tabs} from 'react-bootstrap';
import AnsiRenderer from '../OutputRenderer/OutputRenderer';
import React, {useEffect, useState} from 'react';
import {TestOutputDefaultState} from '../utils/TestOutputDefaultState';

export const TestOutput = ({
                               sourceFiles = [],
                               compilerResult = {},
                               linkerResult = {},
                               runnerResult = {}
                           } = TestOutputDefaultState()) => {

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
        <Tabs activeKey={tab} onSelect={setTab}>
            <Tab title={"Исходный код"} eventKey={"sourceFiles"}>
                {sourceFiles.map(({name, data}) => <div>
                    <b>{name}</b>
                    <pre>{data}</pre>
                </div>)}
            </Tab>
            <Tab title={"Компиляция"} eventKey={"compilation"}>
                <AnsiRenderer {...compilerResult} title={"Результат компиляции:"}/>
            </Tab>
            <Tab title={"Линковка"} eventKey={"linking"}>
                <AnsiRenderer {...linkerResult} title={"Результат линковки:"}/>
            </Tab>
            <Tab title={"Тестирование"} eventKey={"testing"}>
                <AnsiRenderer {...runnerResult} title={"Результат тестирования:"}/>
            </Tab>
        </Tabs>
    </div>);
};