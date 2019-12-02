import React from 'react';
import {Tty} from '../Tty/Tty';

export const ExecOutput = ({
                               stdout = "",
                               exitCode = undefined
                           }) =>
    <Tty stdout={stdout} exitCode={exitCode} title={
        `Код возврата: ${exitCode}`
    }/>;