import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Stepper from '@material-ui/core/Stepper';
import React, {useEffect, useState} from 'react';
import {testOutputsToFailedIndex} from '../../helpers/testOutputsToFailedIndex';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import {TabPanel} from '../TabPanel/TabPanel';
import {ExecOutput} from '../ExecOutput/ExecOutput';


export const BuildResultGeneric = ({
                                       stages = [],
                                       results = [],
                                   }) => {
    const index = testOutputsToFailedIndex(results);

    const stepper = (<Stepper
        activeStep={index}
    >
        {stages.map((name, i) => <Step key={i}>
            <StepLabel
                error={results[i] ? results[i].exitCode !== 0 && 0 <= index : false}
                disabled={!results[i]}
            >
                {name}
            </StepLabel>
        </Step>)}
    </Stepper>);

    const [resultTab, setResultTab] = useState(index);

    useEffect(() => {
        if(resultTab !== index)
            setResultTab(value);
    }, [index]);

    const handleResultTabChange = (event, value) => setResultTab(value);

    const outputs = (<div>
        <Paper square>
            <Tabs value={resultTab} onChange={handleResultTabChange}>
                {stages.map((name, i) => <Tab label={name} id={i}/>)}
            </Tabs>
        </Paper>

        <Paper square>
            {results.map((result, i) =>
                <TabPanel value={resultTab} index={i}>
                    <ExecOutput {...result}/>
                </TabPanel>
            )}
        </Paper>
    </div>);

    return (<div>
        {stepper}
        {outputs}
    </div>);
};

export const BuildResultSpecRunner = ({results}) =>
    <BuildResultGeneric
        results={results}
        stages={[
            `Компиляция теста`,
            `Компиляция примера`,
            `Линковка`,
            `Тестирование`,
        ]}
    />;

export const BuildResultTestSpec = ({results}) =>
    <BuildResultGeneric
        results={results}
        stages={[
            `Компиляция теста`
        ]}
    />;

export const BuildResultTestTarget = ({results}) =>
    <BuildResultGeneric
        results={results}
        stages={[
            `Компиляция`,
            `Линковка`,
            `Тестирование`,
        ]}
    />;