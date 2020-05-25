import React from 'react';
import AceEditor from 'react-ace';

import 'ace-builds/src-min-noconflict/mode-c_cpp';
import 'ace-builds/src-min-noconflict/theme-github';

export const CodeCpp = ({
                            value = ``,
                            onValueChange = () => 0,
                            children = undefined,
                            editor = false
                        }) =>
    <AceEditor
        style={{width: 'inherit'}}
        readOnly={!editor}
        mode="c_cpp"
        theme="github"
        value={children === undefined ? value : children}
        onChange={onValueChange}
        editorProps={{$blockScrolling: true}}
    />;