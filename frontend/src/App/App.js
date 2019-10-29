import React, {useState, useEffect} from 'react';
import {Col, Container, Row, ProgressBar} from 'react-bootstrap';
import {SourceInput} from '../SourceInputForm/SourceInputForm';
import {TestOutput} from '../TestOutput/TestOutput';
import styles from './App.css';
import {api, useApi} from '../api/';
import {TestOutputDefaultState} from '../utils/TestOutputDefaultState';
import TestingProgressbar from '../TestingProgressbar/TestingProgressbar';
import {useFetch} from '../hooks/useFetch';

const App = () => {
    const [userData, userDataLoading, userDataStatus] = useFetch("/auth/user_data.php");
    const [tasksList, taskListLoading] = useApi(["task", "0"]);

    const [outputState, setOutputState] = useState(TestOutputDefaultState());
    const [outputStateLoading, setOutputStateLoading] = useState(false);

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

            const {id} = data;
            window.location.hash = id;
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