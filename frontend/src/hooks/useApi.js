import {useFetch} from './useFetch';
import {API_URL} from '../api';
import urljoin from 'url-join';

export const useApi = (url, init, options, deps) => {
    const {
        data,
        loading,
        error: fetchError,
        status
    } = useFetch(urljoin(API_URL, url), init, options, deps);



    return {
        data,
        loading,
        error: fetchError || (data.errors ? data : null),
        status
    };
};