import create from 'zustand';
import {devtools} from 'zustand/middleware';
import {apiStoreHelper} from '../api';

export const [useStore, storeApi] = create(devtools((set, get) => ({
    widgetId: 0,
    setWidgetId: id => set(state => ({...state, widgetId: id})),

    ...apiStoreHelper("testSpecs", set, () => `/widgets/${get().widgetId}/test-specs/`, []),
    ...apiStoreHelper("testTargets", set, () => `/widgets/${get().widgetId}/test-targets/`, []),

}), "WidgetStore"));