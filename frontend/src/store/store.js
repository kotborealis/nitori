import create from 'zustand';
import {devtools} from 'zustand/middleware';
import {apiStoreHelper, fetchStoreHelper} from './helpers';

const store = (set) => ({
    ...apiStoreHelper("widgets", set, `/widgets/`, []),

    ...apiStoreHelper("testSpecs", set,
        (widgetId) => `/widgets/${widgetId}/test-specs/`,
        []),

    ...apiStoreHelper("testTargets", set,
        (widgetId) => `/widgets/${widgetId}/test-targets/`,
        []),

    ...fetchStoreHelper("userData", set,
        `/auth/user_data.php`,
        {}),

    ...apiStoreHelper("testTarget", set,
        (widgetId, testTargetId) => `/widgets/${widgetId}/test-targets/${testTargetId}`,
        {}),

    ...apiStoreHelper("testTargetSubmit", set,
        (widgetId, testSpecId) => `/widgets/${widgetId}/test-targets/?testSpecId=${testSpecId}`,
        null,
        {
            method: "POST"
        }
    ),
});

export const [useStore, storeApi] = create(devtools(store, "AppStore"));