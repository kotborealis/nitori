import React, {useRef} from 'react';
import {useParams} from 'react-router-dom';
import Container from '@material-ui/core/Container';
import {useApi} from '../../api/useApi';
import {apiActions} from '../../api/apiActions';
import {Loading} from '../../components/InvalidState/Loading';
import {Error} from '../../components/InvalidState/Error';
import {TestTarget} from '../../components/TestTarget/TestTarget';
import {TestTargetInputForm} from '../../components/TestTarget/TestTargetInputForm';
import {Terminal} from "xterm";
import {AttachAddon} from 'xterm-addon-attach';
import {apiUrl, apiWsUrl} from '../../api';

export const Submit = ({}) => {
    const {widgetId} = useParams();

    const testSpecs = useApi(apiActions.testSpecs);
    testSpecs.useFetch({widgetId})([widgetId]);

    const testTargetSubmit = useApi(apiActions.testTargetSubmit);

    const term = useRef(null);
    const termDom = useRef(null);

    const onSubmit = async event => {
        event.preventDefault();

        const formData = new FormData(event.target);

        const testSpecId = formData.get("testSpecId");

        const files = await Promise.all(formData.getAll("sources")
            .map(file => new Promise(resolve => {
                const {name = 'unknown', webkitRelativePath = null, type = 'text/plain'} = file;

                const reader = new FileReader;

                reader.onload = () =>
                    resolve({
                        name: webkitRelativePath || name,
                        type,
                        content: reader.result
                    });

                reader.readAsText(file);
            })));

        testTargetSubmit.fetch({
            widgetId, testSpecId, files, getHeaders: (headers) => {
                term.current = new Terminal();
                console.log(apiWsUrl(headers.get('sandbox-id')));
                const socket = new WebSocket(apiWsUrl(headers.get('sandbox-id')));
                const attachAddon = new AttachAddon(socket);
                term.current.loadAddon(attachAddon);
                term.current.open(termDom.current);
            }
        });
    };

    let result;

    if(testTargetSubmit.init)
        result = null;
    else if(testTargetSubmit.loading)
        result =
            <>
                <div ref={termDom}/>
                <Loading/>
            </>;
    else if(testTargetSubmit.error)
        result = <Error error={testTargetSubmit.error}/>;
    else if(!testTargetSubmit.init)
        result = <TestTarget output={testTargetSubmit.data}/>;

    return (<Container max="lg">
        {testSpecs.loading && <Loading/>}
        {testSpecs.error && <Error error={testSpecs.error}/>}
        {!testSpecs.loading && !testSpecs.error && !testSpecs.init &&
         <TestTargetInputForm
             {...{onSubmit, testSpecs: testSpecs.data}}
             disabled={(testTargetSubmit.loading && !testTargetSubmit.init) || testSpecs.loading}
         />
        }
        {result}
    </Container>);
};