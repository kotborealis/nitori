declare const API_URL: string;

declare function api(url: Array<string> | string, options?: object): {
    data: any,
    error: any,
    status: number
};

export {api, API_URL};