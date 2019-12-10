import create from 'zustand';
import {devtools} from 'zustand/middleware';
import {generateFetchStore} from './helpers';
import {api, fetchJSON} from '../api';
import {produce} from 'immer';

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

const store = (set, get) => ({
    set: fn => set(produce(fn), "set"),

    widgetId: null,
});

export const [useStore, storeApi] =
    create(
        devtools((set, get) => ({
            ...generateFetchStore(storeFetchControlled)(set, get),
            ...store(set, get)
        }), "store")
    );