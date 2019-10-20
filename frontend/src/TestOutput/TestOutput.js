import {Alert} from 'react-bootstrap';
import AnsiRenderer from '../AnsiRenderer/AnsiRenderer';
import React from 'react';

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

    return (<div>
        <div>
            <Alert variant={exitCodeToAlertVariant(compilerResult.exitCode)}>
                Компиляция
            </Alert>
            <AnsiRenderer>{compilerResult.stdout}</AnsiRenderer>
        </div>
        <div>
            <Alert variant={exitCodeToAlertVariant(linkerResult.exitCode)}>
                Линковка
            </Alert>
            <AnsiRenderer>{linkerResult.stdout}</AnsiRenderer>
        </div>
        <div>
            <Alert variant={exitCodeToAlertVariant(runnerResult.exitCode)}>
                Тестирование
            </Alert>
            <AnsiRenderer>{runnerResult.stdout}</AnsiRenderer>
        </div>
    </div>);
};