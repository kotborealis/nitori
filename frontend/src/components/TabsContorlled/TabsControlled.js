import React, {useEffect, useState} from 'react';
import {Tabs} from 'react-bootstrap';

export const TabsControlled =
    ({
         children,
         activeKey,
         ...props
     }) => {
        const [tabState, setTabState] = useState(activeKey);

        useEffect(() => {
            if(tabState !== activeKey)
                setTabState(activeKey);
        }, [activeKey]);

        return (
            <Tabs {...props} onSelect={setTabState} activeKey={tabState}>
                {children}
            </Tabs>
        );
    };