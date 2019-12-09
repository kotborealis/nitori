import urljoin from 'url-join';

export const API_URL = urljoin(process.env.PUBLIC_PATH, `/api/v1/`);

export const apiUrl = (path) => urljoin(API_URL, ...[path].flat());

export const api = async (url, options = {}) => {
    const response = await fetch(apiUrl(url), options);
    const data = await response.json();

    if(data.errors) throw data;

    return data;
};