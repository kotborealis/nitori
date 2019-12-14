import {shallow} from 'zustand';

export const generateFetchStore = (fn) => (set, get, api) => {
    const data = fn(set, get);
    const store = {};

    for(let name of Object.keys(data)){
        const fetcher = data[name];
        store[name] = fetchStoreHelperGeneric(name, set, fetcher);
    }

    return store;
};

/**
 * Class to manage fetch cancelling
 */
class FetchCancelManager {
    name;
    pendingId = null;
    cancelledSet = new Set;

    constructor(name) {
        this.name = name;
    }

    cancel = () => {
        if(this.pendingId){
            this.cancelledSet.add(this.pendingId);
        }
    };

    pend = () => {
        this.pendingId = Math.random().toString(36).substr(2, 9);
        return this.pendingId;
    };

    cancelled = (id) => {
        return this.cancelledSet.has(id);
    };

    clear = (id) => {
        if(this.pendingId === id)
            this.pendingId = null;
        this.cancelledSet.delete(id);
    };
}

const fetchStoreHelperGeneric = (name, set, fetcher) => {
    const fetchCancelManager = new FetchCancelManager(name);
    const nameGen = (...args) => `${name}::${args.join('::')}`;

    return {
        fetcher,
        set,
        data: null,
        init: true,
        loading: true,
        error: null,

        fetch: async (...args) => {
            fetchCancelManager.cancel();
            const id = fetchCancelManager.pend();

            set(
                state => {
                    state[name].init = false;
                    state[name].loading = true;
                    state[name].error = null;
                },
                nameGen('fetchStart', id)
            );

            try{
                const data = await fetcher(...args);

                if(!fetchCancelManager.cancelled(id)){
                    set(
                        state => {
                            state[name].data = data;
                            state[name].error = null;
                        },
                        nameGen('fetchData', id)
                    );
                }
            }
            catch(error){
                if(!fetchCancelManager.cancelled(id)){

                    console.error(nameGen("error"), error);

                    set(
                        state => {
                            state[name].data = null;
                            state[name].error = error;
                        },
                        nameGen('fetchError', id)
                    );
                }
            }finally{
                if(!fetchCancelManager.cancelled(id)){
                    fetchCancelManager.clear(id);

                    set(
                        state => {
                            state[name].loading = false;
                        },
                        nameGen('fetchEnd', id)
                    );
                }
            }
        }
    };
};

/**
 * Use store fetch controlled props by name.
 * @param useStore
 * @param storeApi
 * @returns {function(...[*]=)}
 */
export const createUseApiStore =
    (useStore, storeApi) =>
        (name) =>
            useStore(state => {
                console.log("called usestore", name);
                if(state.hasOwnProperty(name))
                    return {
                        ...state[name],
                        name
                    };

                const [baseName] = name.split('@');

                if(state.hasOwnProperty(baseName)){
                    console.log("CREATE", name);
                    const props = fetchStoreHelperGeneric(name, state[baseName].set, state[baseName].fetcher);

                    state[baseName].set({
                        [name]: props
                    });

                    return {
                        ...props,
                        name
                    };
                }
            }, shallow);