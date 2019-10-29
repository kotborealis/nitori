import React, {useEffect, useState} from 'react';

export const useFetch = (...args) => {
    const [status, setStatus] = useState(0);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const response = await fetch(...args);
            setStatus(response.status);

            try{
                const json = await response.json();
                setData(json);
            }
            catch(e){

            }

            setLoading(false);
        })();
    }, []);

    return [data, loading, status];
};