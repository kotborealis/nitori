import {useFetch} from './useFetch';
import {api_url} from '../api';

export const useApi = (url, init, options, deps) => {
    const {
        data,
        loading,
        error: fetchError,
        status
    } = useFetch(api_url(url), init, options, deps);



    return {
        data,
        loading,
        error: fetchError || (data.errors ? data : null),
        status
    };
};