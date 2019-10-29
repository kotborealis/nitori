import urljoin from 'url-join';
import React, {useEffect, useState} from 'react';

export const API_URL = urljoin(process.env.PUBLIC_PATH, `/api/v1/`);

export const api = (url, options) =>
    fetch(urljoin(API_URL, ...(Array.isArray(url) ? url : [url])), options);

export const useApi = (url, options) => {
    const [status, setStatus] = useState(0);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const response = await api(url, options);
            setStatus(response.status);

            try{
                const json = await response.json();
                setData(json);
            }
            catch(e){

            }

            setLoading(false);
        })();
    }, [...url, options]);

    return [data, loading, status];
};