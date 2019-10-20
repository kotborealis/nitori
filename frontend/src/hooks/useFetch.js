import React, {useEffect, useState} from 'react';

export const useFetch = (...args) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const response = await fetch(...args);
            const json = await response.json();

            setData(json);
            setLoading(false);
        })();
    }, []);

    return [data, loading];
};