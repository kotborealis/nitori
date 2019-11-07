import React, {useEffect, useState} from 'react';
import urljoin from 'url-join';

export const useFetch = (url, options) => {
    const [data, setData] = useState({});
    const [error, setError] = useState({});
    const [status, setStatus] = useState(undefined);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const response = await fetch(urljoin(...(Array.isArray(url) ? url : [url])), options);
            setStatus(response.status);

            try{
                const json = await response.json();
                setData(json);
                if(json.error) setError(json.error);
            }
            catch(e){
                setError(e);
            }

            setLoading(false);
        })();
    }, []);

    return [data, loading, error, status];
};