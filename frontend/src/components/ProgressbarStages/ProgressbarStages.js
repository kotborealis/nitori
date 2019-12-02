import React from 'react';
import {ProgressBar} from 'react-bootstrap';

export const ProgressbarStages = ({state = [], loading = false}) => {
    const defaultProps = {striped: true, animated: loading};
    const initializing = state.length === 0 && loading;

    return (
        <ProgressBar>
            {state.length === 0 &&
             <ProgressBar {...defaultProps} key={0} variant={'info'} now={initializing ? 100 : 0}/>
            }
            {state.length > 0 &&
             state.map(({variant, size}, i) =>
                 <ProgressBar {...defaultProps} key={i} variant={variant} now={size}/>
             )
            }
        </ProgressBar>
    );
};