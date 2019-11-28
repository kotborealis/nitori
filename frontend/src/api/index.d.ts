declare const API_URL: string;

declare function api(url: string, options?: object): {
    data: any,
    error: any,
    status: number
};

declare function api_url(url: string): string

export {api, API_URL, api_url};