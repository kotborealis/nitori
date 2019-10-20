import React from 'react';
import {render} from 'react-dom';
import App from './App/App';
import "!style-loader!css-loader!bootstrap/dist/css/bootstrap.min.css";

render(
    <App/>,
    document.getElementById('App')
);