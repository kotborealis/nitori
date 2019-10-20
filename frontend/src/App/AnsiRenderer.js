import React from 'react';
import Ansi from 'ansi-to-react';
import './AnsiRenderer.css';

export default ({children}) => <pre className="ansi-renderer">
    <Ansi useClasses>{children}</Ansi>
</pre>