import urljoin from 'url-join';
import {encodeGetParams} from '../helpers/encodeGetParams';

export const API_URL = urljoin(process.env.PUBLIC_PATH, `/api/v1/`);

export const apiUrl = (path, query = {}) =>
    `${urljoin(API_URL, ...[path].flat())}?${encodeGetParams(query)}`;

export const api = async (url, query = {}, options = {}) => {
    const response = await fetch(apiUrl(url, query), options);
    const data = await response.json();

    if(data.errors) throw data;

    return data;
};