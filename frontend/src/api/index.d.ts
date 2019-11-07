declare const API_URL: string;

declare function api(url: Array<string> | string, options?: object): Promise<any>;

export {api, API_URL};