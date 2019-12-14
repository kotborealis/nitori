import React from 'react';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Card from '@material-ui/core/Card';
import ReceiptIcon from '@material-ui/icons/Receipt';
import {FileViewer} from '../FileViewer/FileViewer';
import Typography from '@material-ui/core/Typography';
import {TimeUpdated} from '../TimeUpdated/TimeUpdated';

export const TestSpec = ({_id, name, description, timestamp, sourceFiles}) =>
    <Card>
        <CardHeader
            title={name}
            avatar={<ReceiptIcon/>}
            subheader={`Обновлён ${<TimeUpdated>{timestamp}</TimeUpdated>}`}
        />
        <CardContent>
            <Typography variant="body1" style={{padding: "20px"}}>
                {description}
            </Typography>
            <FileViewer files={sourceFiles}/>
        </CardContent>
    </Card>;