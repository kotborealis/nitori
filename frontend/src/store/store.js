import create from 'zustand';
import {devtools} from 'zustand/middleware';
import {generateFetchStore} from './helpers';
import {api, fetchJSON} from '../api';
import {produce} from 'immer';

/**
 * Store props, controlled by fetch functions (see ./api/: fetchJSON, fetchPlainText, api)
 *
 * For each [name] prop in creates next structure in the store:
 * name: {fetch, data, loading, error, ready}
 *
 * * fetch --- calls specified fetch function and sets data, loading, error and ready accordingly to it's execution
 * * data --- return value of fetch function, null by default
 * * loading --- loading status, true/false, null by default
 * * error --- error thrown by fetch function, null by default
 * * ready --- true if not loading and no error, false otherwise
 */
const storeFetchControlled = (set, get) => ({
    widgets: () => api(`/widgets/`),

    testSpecs: () => api(`/widgets/${get().widgetId}/test-specs`),
    testSpec: ({testSpecId}) => api(`/widgets/${get().widgetId}/test-specs/${testSpecId}`,
        {query: {includeSources: true}}),

    testTargets: () => api(`/widgets/${get().widgetId}/test-targets`),
    testTarget: ({testTargetId}) => api(`/widgets/${get().widgetId}/test-targets/${testTargetId}`),

    testTargetSubmit: ({testSpecId}) => api(`/widgets/${get().widgetId}/test-targets/`, {
        query: {testSpecId},
        options: {method: 'POST'}
    }),

    userData: () => fetchJSON(`/auth/user_data.php`)
});

/**
 * Usual store
 *
 * Set --- immer_ized set function
 */
const store = (set, get) => ({
    set: fn => set(produce(fn), "set"),

    widgetId: null,
});

/**
 * Compose stores
 */
export const [useStore, storeApi] =
    create(
        devtools((set, get) => ({
            ...generateFetchStore(storeFetchControlled)(set, get),
            ...store(set, get)
        }), "store")
    );