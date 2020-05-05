import {FetchCancelManager} from './FetchCancelManager';
import {useEffect, useState} from 'react';

export const useApi = (fetcher, deps = []) => {
    const fetchCancelManager = new FetchCancelManager();

    const [state, setState] = useState({
        data: null,
        init: true,
        loading: true,
        error: null,
    });

    const [watchdog, setWatchdog] = useState(0);

    const fetch = (...args) => {
        fetchCancelManager.cancel();
        const id = fetchCancelManager.pend();

        setState({...state, init: false, loading: true, error: null});

        fetcher(...args)
            .then(data => {
                if(!fetchCancelManager.cancelled(id))
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
                if(!fetchCancelManager.cancelled(id)){
                    fetchCancelManager.clear(id);
                }
            });
    };

    const useFetch = (...args) => (deps) => {
        useEffect(() => fetch(...args), deps);
    };

    return {
        ...state,
        fetch,
        useFetch,
        watchdog
    };
};