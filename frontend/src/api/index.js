import urljoin from 'url-join';
import {encodeGetParams} from '../helpers/encodeGetParams';

export const API_URL = urljoin(process.env.PUBLIC_PATH, `/api/v1/`);

export const apiUrl = (...args) => urljoin(API_URL, ...args);

export const fetcherEarlyHeaders = Symbol("fetcherEarlyHeaders");

export const fetchJSON = async (url, {query = {}, options = {}, getHeaders = () => 0} = {}) => {
    const response = await fetch(urljoin(...[url].flat()) + '?' + encodeGetParams(query), options);
    getHeaders(response.headers);
    const data = await response.json();

    if(data.errors) throw data;

    return data;
};

export const fetchPlainText = async (url, {query = {}, options = {}} = {}) => {
    const response = await fetch(urljoin(...[url].flat()) + '?' + encodeGetParams(query), options);
    return await response.text();
};

export const api = async (url, {query = {}, options = {}, getHeaders = () => 0} = {}) =>
    fetchJSON(urljoin(API_URL, url), {query, options, getHeaders});