import {useFetch} from './useFetch';
import {API_URL} from '../api';
import urljoin from 'url-join';

export const useApi = (url, options) => {
    const {
        data: {data, error},
        loading,
        error: fetchError,
        status
    } = useFetch(urljoin(API_URL, url), {}, options);

    return {
        data: data,
        loading,
        error: fetchError || error,
        status
    };
};