import {useFetch} from './useFetch';
import {apiUrl} from '../api';

export const useApi = (url, init, options, deps) => {
    const {
        data,
        loading,
        error: fetchError,
        status
    } = useFetch(apiUrl(url), init, options, deps);



    return {
        data,
        loading,
        error: fetchError || (data.errors ? data : null),
        status
    };
};