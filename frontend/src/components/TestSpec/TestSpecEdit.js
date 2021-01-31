import React, {useRef, useState} from 'react';
import styles from './testSpecEdit.css';
import {CodeCpp} from '../CodeCpp/CodeCpp';
import specSample from './specSample.cpp';
import exampleSample from './exampleSample.cpp';
import {BuildResultAll} from '../BuildResult/BuildResult';
import Button from '@material-ui/core/Button';
import {useApi} from '../../api/useApi';
import {apiActions} from '../../api/apiActions';
import {Loading} from '../InvalidState/Loading';
import {Error} from '../InvalidState/Error';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import Typography from '@material-ui/core/Typography';
import {useHistory} from 'react-router-dom';

import {Terminal} from 'xterm';
import {AttachAddon} from 'xterm-addon-attach';

export const TestSpecEdit = (
    {
        widgetId,
        _id = false,
        name = '',
        description = '',
        removed = false,
        specFile: {content: specFileContent} = {content: null},
        exampleTargetFile: {content: exampleFileContent} = {content: null}
    }
) => {
    const history = useHistory();

    const [specName, setName] = useState(name);
    const [specDescription, setDescription] = useState(description);
    const [spec, setSpec] = useState(specFileContent || specSample);
    const [example, setExample] = useState(exampleFileContent || exampleSample);

    const specRunner = useApi(apiActions.specRunner);
    const testSpecSubmit = useApi(apiActions.testSpecSubmit);

    const term = useRef(null);
    const termDom = useRef(null);

    const handleBuild = () => {
        testSpecSubmit.reset();
        specRunner.fetch({
            spec, example, getHeaders: (headers) => {
                term.current = new Terminal();
                const socket = new WebSocket('ws://localhost:3000/ws/' + headers.get('sandbox-id'));
                const attachAddon = new AttachAddon(socket);
                term.current.loadAddon(attachAddon);
                term.current.open(termDom.current);
            }
        });
    };

    const handleSave = () => {
        specRunner.reset();
        testSpecSubmit.fetch({
            widgetId,
            testSpecId: _id,
            name: specName,
            description: specDescription,
            spec,
            example
        });
    };

    const handleDelete = async () => {
        confirm(`Удалить задание ${specName}?`)
        && await apiActions.testSpecDelete({widgetId, testSpecId: _id})
        && (removed = true);
    };

    let specRunnerResult;
    if(specRunner.init) specRunnerResult = null;
    else if(specRunner.loading) specRunnerResult = (<div>
        <div ref={termDom}/>
        <Loading/>
    </div>);
    else if(specRunner.error) specRunnerResult = <>SPEC RUNNER ERROR {JSON.stringify(specRunner)}<Error error={specRunner.error}/></>;
    else if(specRunner.data) specRunnerResult = <BuildResultAll results={specRunner.data}/>;

    let specSubmitResult;
    if(testSpecSubmit.init) specSubmitResult = null;
    else if(testSpecSubmit.loading) specSubmitResult = <Loading/>;
    else if(testSpecSubmit.error) specSubmitResult = <Error error={testSpecSubmit.error}/>;
    else if(testSpecSubmit.data){
        testSpecSubmit.reset();
        history.push(`/dashboard/${widgetId}/test-specs/${testSpecSubmit.data._id}`);
    }

    return (
        <>
            <div className={``}>
                <FormControl className={styles.formControl}>
                    <TextField
                        label="Название задания"
                        variant="outlined"
                        fullWidth
                        value={specName}
                        onChange={({target: {value}}) => setName(value)}
                    />
                    <TextField
                        label="Описание задания (markdown)"
                        variant="outlined"
                        multiline={true}
                        fullWidth
                        rows={4}
                        rowsMax={4}
                        value={specDescription}
                        onChange={({target: {value}}) => setDescription(value)}
                    />
                </FormControl>
            </div>
            {_id && <div>
                <Button
                    variant="outlined"
                    color="secondary"
                    component="label"
                    style={{width: 300}}
                    onClick={handleDelete}
                    disabled={removed}
                >
                    {removed ? 'Удалено' : 'Удалить'}
                </Button>
            </div>}
            <div className={styles.editorsLayout}>
                <div>
                    <Typography>Код теста</Typography>
                    <CodeCpp editor={true} value={spec} onValueChange={setSpec}/>
                </div>
                <div>
                    <Typography>Код примера</Typography>
                    <CodeCpp editor={true} value={example} onValueChange={setExample}/>
                </div>
            </div>
            <div>
                <Button
                    variant="outlined"
                    color="secondary"
                    component="label"
                    style={{width: 300}}
                    onClick={handleBuild}
                >
                    Проверить сборку
                </Button>
                <Button
                    variant="outlined"
                    color="primary"
                    component="label"
                    style={{width: 300}}
                    onClick={handleSave}
                    disabled={removed}
                >
                    Сохранить
                </Button>
            </div>
            <div>
                {specRunnerResult}
            </div>
            <div>
                {specSubmitResult}
            </div>
        </>
    );
};