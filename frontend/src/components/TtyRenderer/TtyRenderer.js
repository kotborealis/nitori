import React from 'react';
import Ansi from 'ansi-to-react';
import style from './TtyRenderer.css';
import {Alert} from 'react-bootstrap';

const exitCodeToAlertVariant = (code) => {
    if(code === 0) return 'success';
    if(code === undefined) return 'light';
    return 'danger';
};

export default ({exitCode = undefined, title="", stdout=""}) => {
    let pre;
    if(exitCode !== undefined) {
        pre = (<pre>
            <Ansi useClasses linkify={false}>{
                stdout.replace(/\r/g, '')
            }</Ansi>
        </pre>);
    }

    return (<div className="output-renderer">
        <Alert variant={exitCodeToAlertVariant(exitCode)} className={style.title}>
            {title}
        </Alert>
        {pre}
    </div>)
};