import {Col, Row} from 'react-bootstrap';
import React from 'react';
import styles from './index.css';
import {TestSpecsList} from '../../components/TestSpecsList/TestSpecsList';
import {useApi} from '../../hooks/useApi';

export default () => {
    const {
        data: testSpecsData,
        loading: testSpecsLoading,
        error: testSpecsError
    } = useApi('/widgets/0/test-specs/', []);

    return (
        <Row className={styles.row}>
            <Col>
                <h2>test-specs</h2>
                <TestSpecsList
                    data={testSpecsData}
                    loading={testSpecsLoading}
                    error={testSpecsError}
                />
            </Col>
        </Row>
    );
};