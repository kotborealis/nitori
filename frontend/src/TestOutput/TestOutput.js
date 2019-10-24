import {Alert, Tab, Tabs} from 'react-bootstrap';
import AnsiRenderer from '../AnsiRenderer/AnsiRenderer';
import React, {useState, useEffect} from 'react';

export const TestOutputDefaultState = () => ({
    compilerResult: {exitCode: undefined, stdout: ""},
    linkerResult: {exitCode: undefined, stdout: ""},
    runnerResult: {exitCode: undefined, stdout: ""},
});

export const TestOutput = ({
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
            <Tab title={"Компиляция"} eventKey={"compilation"}>
                <Alert variant={exitCodeToAlertVariant(compilerResult.exitCode)}>
                    Компиляция
                </Alert>
                <AnsiRenderer>{compilerResult.stdout}</AnsiRenderer>
            </Tab>
            <Tab title={"Линковка"} eventKey={"linking"}>
                <Alert variant={exitCodeToAlertVariant(linkerResult.exitCode)}>
                    Линковка
                </Alert>
                <AnsiRenderer>{linkerResult.stdout}</AnsiRenderer>
            </Tab>
            <Tab title={"Тестирование"} eventKey={"testing"}>
                <Alert variant={exitCodeToAlertVariant(runnerResult.exitCode)}>
                    Тестирование
                </Alert>
                <AnsiRenderer>{runnerResult.stdout}</AnsiRenderer>
            </Tab>
        </Tabs>
    </div>);
};