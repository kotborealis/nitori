import {FetchCancelManager} from './FetchCancelManager';
import {useEffect, useRef, useState} from 'react';

const initialState = {
    data: null,
    init: true,
    loading: true,
    error: null,
};

export const useApi = (fetcher, deps = []) => {
    const fetchCancelManager = useRef(new FetchCancelManager());

    const [state, setState] = useState(initialState);

    const [watchdog, setWatchdog] = useState(0);

    const fetch = (...args) => {
        fetchCancelManager.current.cancel();
        const id = fetchCancelManager.current.pend();

        setState({...state, init: false, loading: true, error: null});

        fetcher(...args)
            .then(data => {
                if(!fetchCancelManager.current.cancelled(id))
                    setState({
                        data,
                        error: null,
                        loading: false,
                        init: false
                    });
            })
            .catch(error =>
                setState({
                    data: null,
                    error,
                    loading: false,
                    init: false
                })
            )
            .finally(() => {
                setWatchdog(watchdog + 1);
                if(!fetchCancelManager.current.cancelled(id)){
                    fetchCancelManager.current.clear(id);
                }
            });
    };

    const useFetch = (...args) => (deps) => {
        useEffect(() => fetch(...args), deps);
    };

    const reset = () => {
        fetchCancelManager.current.cancel();
        setState(initialState);
    }

    return {
        ...state,
        fetch,
        useFetch,
        watchdog,
        reset
    };
};