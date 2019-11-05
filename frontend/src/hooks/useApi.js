import {useFetch} from './useFetch';
import {API_URL} from '../api';

export const useApi = (url, options) => useFetch([API_URL, ...url], options);