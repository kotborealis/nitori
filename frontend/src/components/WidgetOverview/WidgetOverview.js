import React from 'react';
import {generatePath, useHistory, useParams} from 'react-router-dom';
import {Paper, TextField} from '@material-ui/core';
import InputLabel from '@material-ui/core/InputLabel';
import Button from '@material-ui/core/Button';
import {apiUrl} from '../../api';

export const WidgetOverview = () => {
    const history = useHistory();
    const {widgetId} = useParams();

    const handleFocus = (event) => event.target.select();

    const handleDl = () =>
        window.location = apiUrl(`/widgets/${widgetId}/test-targets/download`);

    return (
        <>
            <Paper style={{padding: 20}}>
                <InputLabel id="link-label">
                    Отправка решений (для студентов):
                </InputLabel>
                <TextField
                    labelId="link-label"
                    value={location.host + generatePath(`/submit/${widgetId}`)}
                    fullWidth
                    size={`medium`}
                    variant={`outlined`}
                    onFocus={handleFocus}
                />
            </Paper>
            <Paper style={{padding: 20}}>
                <InputLabel id="dl-btn">
                    Полученный `.tar` архив корректно открывается только через UNIX-tar.
                </InputLabel>
                <Button variant="contained" color="primary" id="dl-btn" onClick={handleDl}>
                    Скачать архив со всеми решениями.
                </Button>
            </Paper>
        </>
    );
};