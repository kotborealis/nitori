import React from 'react';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import {testOutputsToFailedIndex} from '../../helpers/testOutputsToFailedIndex';

export const TestTargetStepper =
    ({
         compilerResult,
         linkerResult,
         runnerResult
     }) => {

        const index = testOutputsToFailedIndex([
            compilerResult, linkerResult, runnerResult
        ]);

        return (
            <Stepper
                activeStep={index}
            >
                <Step key={0}>
                    <StepLabel
                        error={compilerResult.exitCode !== 0 && 0 <= index}
                    >
                        Компиляция
                    </StepLabel>
                </Step>
                <Step key={1}>
                    <StepLabel
                        error={linkerResult.exitCode !== 0 && 1 <= index}
                    >
                        Линковка
                    </StepLabel>
                </Step>
                <Step key={2}>
                    <StepLabel
                        error={runnerResult.exitCode !== 0 && 2 <= index}
                    >
                        Тестирование
                    </StepLabel>
                </Step>
            </Stepper>
        );
    };