import create from 'zustand';
import {devtools} from 'zustand/middleware';
import {createUseApiStore, generateFetchStore} from './helpers';
import {api, fetchJSON} from '../api';
import {produce} from 'immer';

/**
 * Store props, controlled by fetch functions (see ./api/: fetchJSON, fetchPlainText, api)
 *
 * For each [name] prop in creates next structure in the store:
 * name: {fetch, data, loading, error}
 *
 * * fetch --- calls specified fetch function and sets data, loading and error accordingly to it's execution
 * * data --- return value of fetch function, null by default
 * * loading --- loading status, true/false, true by default
 * * error --- error thrown by fetch function, null by default
 */
const storeFetchControlled = (set, get) => ({
    widgets: () => api(`/widgets/`),

    testSpecs:
        ({
             limit = 100,
             skip = 0,
             name,
             sortBy = 'name',
             orderBy = 'asc',
         } = {}) => api(`/widgets/${get().widgetId}/test-specs`, {
            query: {
                limit,
                skip,
                ...(name ? {name} : {}),
                sortBy,
                orderBy,
            }
        }),

    testSpec: ({testSpecId}) => api(`/widgets/${get().widgetId}/test-specs/${testSpecId}`,
        {query: {includeSources: true}}),

    testTargets: () => api(`/widgets/${get().widgetId}/test-targets`),
    testTarget: ({testTargetId}) => api(`/widgets/${get().widgetId}/test-targets/${testTargetId}`),

    testTargetSubmit: ({formData}) =>
        api(`/widgets/${get().widgetId}/test-targets/`, {
            query: {
                testSpecId: formData.get('testSpecId')
            },
            options: {
                method: 'POST',
                body: formData
            }
        }),

    testSpecSubmit: ({formData, testSpecId = false}) =>
        api(`/widgets/${get().widgetId}/test-specs/${testSpecId || ""}`, {
            query: {
                name: formData.get('name'),
                description: formData.get('description')
            },
            options: {
                method: testSpecId === false ? 'POST' : 'PUT',
                body: formData
            }
        }),

    testSpecDelete: ({testSpecId}) =>
        api(`/widgets/${get().widgetId}/test-specs/${testSpecId}`, {
            options: {
                method: 'DELETE',
            }
        }),

    userData: () => fetchJSON(`/auth/user_data.php`)
});

/**
 * Usual store
 *
 * Set --- immerized set function
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
        devtools((set, get, api) => ({
            ...generateFetchStore(storeFetchControlled)(set, get, api),
            ...store(set, get, api)
        }))
    );

export const useApiStore = createUseApiStore(useStore, storeApi);