import React from 'react';
import Ansi from 'ansi-to-react';
import './Tty.css';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import {exitCodeToIcon} from '../../helpers/exitCodeToIcon';

const exitCodeToAlertVariant = (code) => {
    if(code === 0) return 'success';
    if(code === undefined) return 'light';
    return 'danger';
};

export const Tty = ({exitCode = undefined, title = "", stdout = ""}) => {
    let pre;
    if(exitCode !== undefined){
        pre = (
            <pre>
                <Ansi useClasses linkify={false}>
                    {stdout.replace(/\r/g, '')}
                </Ansi>
            </pre>
        );
    }

    const StatusIcon = exitCodeToIcon(exitCode);

    return (
        <Card>
            <CardHeader
                title={"Результат выполнения"}
                avatar={<StatusIcon/>}
                subheader={title}
            />
            <CardContent className="output-renderer">
                {pre}
            </CardContent>
        </Card>
    );
};