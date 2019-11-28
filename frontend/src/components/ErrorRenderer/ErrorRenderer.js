import React from 'react';
import {Alert} from 'react-bootstrap';

export const ErrorRenderer = ({error: {errors = [], message = ""}}) =>
    <Alert variant="danger">
        <Alert.Heading>Error: {message}</Alert.Heading>
        <p>
            {errors.map(error => <>{JSON.stringify(error)}</>)}
        </p>
    </Alert>;