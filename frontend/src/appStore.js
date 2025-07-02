import { create } from "zustand";
import { persist } from "zustand/middleware";

let appStore = (set) => ({
    dopen: true,
    UpdateOpen: (dopen) => set((state) => ({ dopen })),

});

appStore=persist (appStore)
export const useAppStore= create(appStore);