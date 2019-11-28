import styles from './index.css';
import {Container} from 'react-bootstrap';
import React from 'react';

export const BlockContainer = ({children}) =>
    <Container className={styles.container}>
        {children}
    </Container>;