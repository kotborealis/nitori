import urljoin from 'url-join';
import {produce} from 'immer';

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

export const apiStoreHelper = (name, set, url, init = [], options = {}) => {
    const nameGen = (...args) => `${name}::${args.join('::')}`;
    return {
        [name]:
            {
                data: init,
                loading: null,
                error: null,

                fetch: async () => {
                    set(
                        state => produce(state, state => void (state[name].loading = true)),
                        nameGen('setLoading')
                    );

                    try{
                        const {data} = await api(typeof url === "function" ? url() : url, options);
                        set(
                            state => produce(state, state => void (state[name].data = data)),
                            nameGen('setData')
                        );
                    }
                    catch(error){
                        set(
                            state => produce(state, state => void (state[name].error = error)),
                            nameGen('setError')
                        );
                    }finally{
                        set(
                            state => produce(state, state => void (state[name].loading = false)),
                            nameGen('setLoading')
                        );
                    }
                }
            }
    };
};