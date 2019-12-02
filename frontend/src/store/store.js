import create from 'zustand';
import {devtools} from 'zustand/middleware';
import {apiStoreHelper, fetchStoreHelper} from './helpers';

const store = (set) => ({
    ...apiStoreHelper("testSpecs", set, (widgetId) => `/widgets/${widgetId}/test-specs/`, []),
    ...apiStoreHelper("testTargets", set, (widgetId) => `/widgets/${widgetId}/test-targets/`, []),
    ...fetchStoreHelper("userData", set, `/auth/user_data.php`, {}),
});

export const [useStore, storeApi] = create(devtools(store, "AppStore"));