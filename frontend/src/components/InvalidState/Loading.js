import React from 'react';
import {LinearProgress} from '@material-ui/core';
import Fade from '@material-ui/core/Fade';

export const Loading = () =>
    <Fade
        in={true}
        style={{
            transitionDelay: '500ms',
            marginTop: '15px',
            marginBottom: '15px',
            width: '100%'
        }}
    >
        <LinearProgress variant="query"/>
    </Fade>;