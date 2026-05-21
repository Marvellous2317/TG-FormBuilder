import { create } from 'zustand';
import { createJSONStorage } from 'zustand/middleware';

const initialState = {
  logbookTitle: null,
  documentNumber: null,
};

const storage =
  typeof window !== 'undefined'
    ? createJSONStorage(() => localStorage)
    : undefined;

export const useChecklistStore = create(
  (set) => ({
    ...initialState,
    setLogbookTitle: (logbookTitle) => set({ logbookTitle }),
    setDocumentNumber: (documentNumber) => set({ documentNumber }),
    clearChecklist: () =>
      set(() => ({
        ...initialState,
      })),
  }),
  {
    name: 'checklist-storage',
    storage,
    partialize: (state) => ({
      logbookTitle: state.logbookTitle,
      documentNumber: state.documentNumber,
    }),
  },
);
