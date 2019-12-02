import React from 'react';
import {PrismAsyncLight as SyntaxHighlighter} from 'react-syntax-highlighter';
import {tomorrow} from 'react-syntax-highlighter/dist/cjs/styles/prism';

export const CodeCpp = ({name, children}) =>
    <SyntaxHighlighter language="cpp" style={tomorrow} showLineNumbers={true}>
        {children}
    </SyntaxHighlighter>;