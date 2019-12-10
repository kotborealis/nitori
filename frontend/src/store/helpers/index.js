import {produce} from 'immer';

export const generateFetchStore = (fn) => (set, get, api) => {
    const data = fn(set, get);
    const store = {};

    for(let name of Object.keys(data)){
        const fetcher = data[name];
        store[name] = fetchStoreHelperGeneric(name, set, fetcher);
    }

    return store;
};

const fetchStoreHelperGeneric = (name, set, fetcher) => {
    const nameGen = (...args) => `${name}::${args.join('::')}`;

    return {
        data: null,
        loading: null,
        error: null,
        ready: false,

        fetch: async (...args) => {
            console.log(nameGen("fetch called"));
            set(
                state => produce(state, state => {
                    state[name].loading = true;
                    state[name].error = null;
                    state[name].ready = false;
                }),
                nameGen('fetchStart')
            );

            try{
                const data = await fetcher(...args);
                set(
                    state => produce(state, state => {
                        state[name].data = data;
                        state[name].error = null;
                        state[name].ready = true;
                    }),
                    nameGen('fetchData')
                );
            }
            catch(error){
                console.error(nameGen("error"), error);
                set(
                    state => produce(state, state => {
                        state[name].data = null;
                        state[name].error = error;
                        state[name].ready = false;
                    }),
                    nameGen('fetchError')
                );
            }finally{
                set(
                    state => produce(state, state => {
                        state[name].loading = false;
                    }),
                    nameGen('fetchEnd')
                );
            }
        }
    };
};