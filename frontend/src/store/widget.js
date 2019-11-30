import create from 'zustand';
import {devtools} from 'zustand/middleware';

export const [useWidgetStore, widgetStoreApi] = create(devtools(set => ({
    widgetId: 0,
    setWidgetId: id => set(state => ({...state, widgetId: id}))
})), "WidgetStore");