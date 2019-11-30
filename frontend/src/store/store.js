import create from 'zustand';
import {devtools} from 'zustand/middleware';
import {apiStoreHelper} from '../api';

const store = (set, get) => ({
    widgetId: 0,
    setWidgetId: id => set(state => ({...state, widgetId: id}), 'setWidgetId'),

    ...apiStoreHelper("testSpecs", set, () => `/widgets/${get().widgetId}/test-specs/`, []),
    ...apiStoreHelper("testTargets", set, () => `/widgets/${get().widgetId}/test-targets/`, []),
});

export const [useStore, storeApi] = create(devtools(store, "WidgetStore"));