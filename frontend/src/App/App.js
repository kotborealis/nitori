import React, {useState, useEffect} from 'react';
import {Alert, Col, Container, Row} from 'react-bootstrap';
import {SourceInput} from '../SourceInputForm/SourceInputForm';
import {TestOutput} from '../TestOutput/TestOutput';
import styles from './App.css';
import {api} from '../api/';
import {TestOutputDefaultState} from '../utils/TestOutputDefaultState';
import TestingProgressbar from '../TestingProgressbar/TestingProgressbar';
import {useFetch} from '../hooks/useFetch';
import {useApi} from '../hooks/useApi';

const App = () => {
    const [userData = null, userDataLoading, /* userError */, userDataStatus] = useFetch("/auth/user_data.php");
    const [tasksList = [], taskListLoading, tasksListError] = useApi(["task", "0"]);

    const [outputState, setOutputState] = useState(TestOutputDefaultState());
    const [outputStateLoading, setOutputStateLoading] = useState(false);

    const [testId, setTestId] = useState("");

    useEffect(() => {
        if(window.location.hash.length > 1){
            const hash = window.location.hash.slice(1);
            setTestId(hash);

            (async () => {
                const res = await api(["test", hash]);
                const {data, error} = await res.json();
                if(error){
                    alert(JSON.stringify(error));
                    setOutputStateLoading(false);
                }
                else{
                    setOutputState({
                        ...TestOutputDefaultState(),
                        ...data
                    });
                    setOutputStateLoading(false);
                }
            })();
        }
    }, []);

    useEffect(() => {
        window.location.hash = testId;

        return () => window.location.hash = "";
    }, [testId]);

    useEffect(() => {
        const hash = window.location.hash.slice(1);
        if(hash){
            (async () => {
                const res = await api(["test", hash]);
                const {data, error} = await res.json();
                if(error){
                    alert(JSON.stringify(error));
                    setOutputStateLoading(false);
                }
                else{
                    setOutputState({
                        ...TestOutputDefaultState(),
                        ...data
                    });
                    setOutputStateLoading(false);
                }
            })();
        }
    }, []);

    const onSubmit = async (event) => {
        event.preventDefault();

        setOutputState(TestOutputDefaultState());

        setTestId("");

        const formData = new FormData(event.target);

        setOutputStateLoading(true);
        const res = await api("test", {
            method: "POST",
            body: formData
        });

        const {data, error} = await res.json();

        if(error){
            alert(JSON.stringify(error));
            setOutputStateLoading(false);
        }
        else{
            setOutputState({
                ...TestOutputDefaultState(),
                ...data
            });
            setOutputStateLoading(false);

            setTestId(data._id);
        }
    };

    return (<Container className={styles.container}>
        {userData === null && !userDataLoading ? (<Row className={styles.row}>
            <Col>
                <Alert variant={"danger"}>
                    <Alert.Heading>Требуется аутентификация</Alert.Heading>
                    <p><a href={"#login.php"}>Аутентификация</a></p>
                </Alert>
            </Col>
        </Row>) : null}
        <Row className={styles.row}>
            <Col>
                <SourceInput {...{onSubmit, tasksList}} disabled={outputStateLoading || taskListLoading}/>
            </Col>
        </Row>
        <Row className={styles.row}>
            <Col>
                <TestingProgressbar state={outputState} loading={outputStateLoading}/>
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