import React, {useState} from 'react';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import AttachmentIcon from '@material-ui/icons/Attachment';
import {CodeCpp} from '../CodeCpp/CodeCpp';

const TabPanel = ({children, value, index}) => value === index && <div>{children}</div>;

export const FileViewer = ({files = []}) => {
    const [sourceCodeTab, setSourceCodeTab] = useState(0);
    const handleSourceCodeTabChange = (event, value) => setSourceCodeTab(value);

    return (<>
        <Paper square>
            <Tabs value={sourceCodeTab} onChange={handleSourceCodeTabChange}>
                {files.map(({name}, index) =>
                    <Tab label={name} id={index} icon={<AttachmentIcon/>}/>
                )}
            </Tabs>
        </Paper>

        {files.map(({content}, index) =>
            <TabPanel value={sourceCodeTab} index={index}>
                <CodeCpp>{content}</CodeCpp>
            </TabPanel>
        )}
    </>);
};