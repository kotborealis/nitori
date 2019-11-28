import urljoin from 'url-join';

export const API_URL = urljoin(process.env.PUBLIC_PATH, `/api/v1/`);

export const api_url = url => urljoin(API_URL, url);

export const api = async (url, options) => {
    const response = await fetch(api_url(url), options);
    const status = response.status;
    const data = await response.json();

    if(data.errors) throw data;

    return {
        data,
        status
    };
};