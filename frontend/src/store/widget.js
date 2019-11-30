import create from 'zustand';
import {devtools} from 'zustand/middleware';

export const [useStoreWidget] = create(devtools(set => ({
    widgetId: 0,
    setWidgetId: id => {
        console.log("calleD", id);
        set(state => ({...state, widgetId: id}));
    }
})));