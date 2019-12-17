import React from 'react';

export const TabPanel = ({children, value, index}) => value === index && <div>{children}</div>;