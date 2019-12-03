import styles from './index.css';
import React from 'react';

export const BlockContainer = ({children}) =>
    <div className={styles.container}>
        {children}
    </div>;