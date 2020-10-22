import {exitCodeToIcon} from '../../helpers/exitCodeToIcon';
import {exitCodeToColor} from '../../helpers/exitCodeToColor';
import Chip from '@material-ui/core/Chip';
import React from 'react';

export const testTargetResultBadges = ({targetCompilerResult, specCompilerResult, linkerResult, runnerResult}) => {
    const TargetIcon = exitCodeToIcon(targetCompilerResult?.exitCode);
    const SpecIcon = exitCodeToIcon(specCompilerResult?.exitCode);
    const LinkerIcon = exitCodeToIcon(linkerResult?.exitCode);
    const RunnerIcon = exitCodeToIcon(runnerResult?.exitCode);

    const targetColor = exitCodeToColor(targetCompilerResult?.exitCode);
    const specColor = exitCodeToColor(specCompilerResult?.exitCode);
    const linkerColor = exitCodeToColor(linkerResult?.exitCode);
    const runnerColor = exitCodeToColor(runnerResult?.exitCode);

    return (
        <>
            <Chip icon={<TargetIcon/>} color={targetColor} label="Компиляция"/>
            <Chip icon={<SpecIcon/>} color={specColor} label="Компиляция теста"/>
            <Chip icon={<LinkerIcon/>} color={linkerColor} label="Линковка"/>
            <Chip icon={<RunnerIcon/>} color={runnerColor} label="Тесты"/>
        </>
    );
};