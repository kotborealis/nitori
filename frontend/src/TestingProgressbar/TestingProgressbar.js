import React from 'react';
import {TestOutputDefaultState} from '../utils/TestOutputDefaultState';
import {ProgressBar} from 'react-bootstrap';

export default ({state = TestOutputDefaultState(), loading = false}) => {

    const progress = () => {
        const _ = {};
        ['compilerResult', 'linkerResult', 'runnerResult'].forEach(key => {
            const {exitCode} = state[key];
            if(exitCode === undefined) {
                _[key] = {now: 0};
            }
            else if(exitCode !== 0) {
                _[key] = {now: 100/3, variant: 'danger'};
            }
            else {
                _[key] = {now: 100/3, variant: 'success'};
            }
        });
        return _;
    };

    const initializing = () =>
        ['compilerResult', 'linkerResult', 'runnerResult']
            .every(key => state[key].exitCode === undefined);

    return (<ProgressBar>
        <ProgressBar striped animated={loading} key={0} variant={'info'} now={initializing() && loading ? 100 : 0}/>
        <ProgressBar striped animated={loading} key={1} {...progress().compilerResult}/>
        <ProgressBar striped animated={loading} key={2} {...progress().linkerResult}/>
        <ProgressBar striped animated={loading} key={3} {...progress().runnerResult}/>
    </ProgressBar>);
}