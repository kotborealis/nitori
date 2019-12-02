import urljoin from 'url-join';

export const API_URL = urljoin(process.env.PUBLIC_PATH, `/api/v1/`);

export const apiUrl = url => urljoin(API_URL, url);

export const api = async (url, options) => {
    const response = await fetch(apiUrl(url), options);
    const status = response.status;
    const data = await response.json();

    if(data.errors) throw data;

    return {
        data,
        status
    };
};