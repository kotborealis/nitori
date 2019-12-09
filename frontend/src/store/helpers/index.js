import {produce} from 'immer';
import {api} from '../../api';

const fetchStoreHelperGeneric = (fetcher) => (name, set, url, init = [], default_options = {}) => {
    const nameGen = (...args) => `${name}::${args.join('::')}`;
    return {
        [name]:
            {
                data: init,
                loading: false,
                error: null,

                fetch: async (args = [], options = {}) => {
                    const fetch_url = typeof url === "function" ? url(...args) : url;
                    set(
                        state => produce(state, state => {
                            state[name].loading = true;
                            state[name].error = null;
                        }),
                        nameGen('fetchStart')
                    );

                    try{
                        const data = await fetcher(fetch_url, {...default_options, ...options});
                        set(
                            state => produce(state, state => {
                                state[name].data = data;
                                state[name].error = null;
                            }),
                            nameGen('fetchData')
                        );
                    }
                    catch(error){
                        set(
                            state => produce(state, state => {
                                state[name].data = init;
                                state[name].error = error;
                            }),
                            nameGen('fetchError')
                        );
                    }finally{
                        set(
                            state => produce(state, state => void (state[name].loading = false)),
                            nameGen('fetchEnd')
                        );
                    }
                }
            }
    };
};

export const fetchStoreHelper = fetchStoreHelperGeneric(async (path, options = {}) => {
    const res = await fetch(path, options);
    return res.json();
});
export const apiStoreHelper = fetchStoreHelperGeneric(api);