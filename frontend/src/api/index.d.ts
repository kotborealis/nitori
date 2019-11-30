declare const API_URL: string;

declare function api(url: string, options?: object): {
    data: any,
    error: any,
    status: number
};

declare function apiUrl(url: string): string

declare function apiStoreHelper(name: string, set: Function, url: string | Function, init?: any, options?: object): {
    [name]: {
        data: any,
        loading: boolean,
        error: any,
        status: number
    }
};

export {api, API_URL, apiUrl, apiStoreHelper};