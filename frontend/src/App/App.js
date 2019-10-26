import React, {useState} from 'react';
import {Col, Container, Row, ProgressBar} from 'react-bootstrap';
import {SourceInput} from '../SourceInputForm/SourceInputForm';
import {TestOutput, TestOutputDefaultState} from '../TestOutput/TestOutput';
import styles from './App.css';
import {API_URL} from '../config';
import {useFetch} from '../hooks/useFetch';

const App = () => {
    const [userData, userDataLoading, userDataStatus] = useFetch("/auth/user_data.php");
    const [tasksList, taskListLoading] = useFetch(API_URL + "/task_list/");

    const [outputState, setOutputState] = useState(TestOutputDefaultState());
    const [outputStateLoading, setOutputStateLoading] = useState(false);

    const outputStateToProgress = () => {
        const _ = {};
        ['compilerResult', 'linkerResult', 'runnerResult'].forEach(key => {
            const {exitCode} = outputState[key];
            if(exitCode === undefined) {
                _[key] = {now: 0};
            }
            else if(exitCode !== 0) {
                _[key] = {now: 100/3, variant: 'danger'};
            }
            else {
                _[key] = {now: 100/3, variant: 'success'};
            }
        });
        return _;
    };

    const onSubmit = async (event) => {
        event.preventDefault();

        setOutputState(TestOutputDefaultState());

        const formData = new FormData(event.target);

        setOutputStateLoading(true);
        const res = await fetch(API_URL + "/test_target/", {
            method: "POST",
            body: formData
        });

        const {data, error} = await res.json();

        if(data && data.taskId){
            let state = TestOutputDefaultState();
            const sse = new EventSource(API_URL + "/test_target/sse/" + data.taskId);
            const reduceState = ({data}) => {
                const {data: newState} = JSON.parse(data);
                state = {...state, ...newState};
                setOutputState(state);
            };
            sse.addEventListener('error', ({data}) =>
                alert(JSON.stringify(data))
            );

            sse.addEventListener('stop', () => {
                sse.close();
                setOutputStateLoading(false);
            });

            sse.addEventListener('compilation', reduceState);
            sse.addEventListener('linking', reduceState);
            sse.addEventListener('testing', reduceState);
        }
        else if(error){
            alert(JSON.stringify(error));
        }
    };

    const userGreeter = (() => {
        if(userDataLoading) return null;
        if(userDataStatus === 400) return (<div>
            Добро пожаловать. Снова.
        </div>);
        else return (<div>
            Добро пожаловать, {userData.name}. Снова.
        </div>);
    })();

    return (<Container className={styles.container}>
        <Row className={styles.row}>
            <Col>
                {userGreeter}
            </Col>
        </Row>
        <Row className={styles.row}>
            <Col>
                <SourceInput {...{onSubmit, tasksList}} disabled={outputStateLoading || taskListLoading}/>
            </Col>
        </Row>
        <Row className={styles.row}>
            <Col>
                <ProgressBar>
                    <ProgressBar striped animated key={1} {...outputStateToProgress().compilerResult}/>
                    <ProgressBar striped animated key={2}  {...outputStateToProgress().linkerResult}/>
                    <ProgressBar striped animated key={3}  {...outputStateToProgress().runnerResult}/>
                </ProgressBar>
            </Col>
        </Row>
        <Row className={styles.row}>
            <Col>
                <TestOutput {...outputState}/>
            </Col>
        </Row>
    </Container>);
};

export default App;