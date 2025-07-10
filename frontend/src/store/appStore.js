import { create } from 'zustand';
import { getCookie, setCookie } from '../utils/cookieSetterAndGetter';

function getInitialDopen() {
    const cookieVal = getCookie('dopen');
    if (cookieVal === 'false') return false;
    if (cookieVal === 'true') return true;
    return true; // default open
}

export const useAppStore = create((set) => ({
    dopen: getInitialDopen(),
    updateOpen: (dopen) => {
        setCookie('dopen', dopen);
        set({ dopen });
    },
}));
