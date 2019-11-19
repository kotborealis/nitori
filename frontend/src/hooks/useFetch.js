import React, {useEffect, useState} from 'react';

export const useFetch = (url, init = null, options = {}, deps = [url]) => {
    const [data, setData] = useState(init);
    const [error, setError] = useState(null);
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancel = false;

        const req = async () => {
            const response = await fetch(url, options);
            setStatus(response.status);

            const json = await response.json();
            setLoading(false);

            if(cancel)
                return;

            setData(json);
        };

        req().catch(setError);

        return () => { cancel = true };
    }, [...deps]);

    return {
        data,
        loading,
        error,
        status
    };
};