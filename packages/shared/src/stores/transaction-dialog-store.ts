import { create } from "zustand";

interface TransactionDialogState {
  isOpen: boolean;
  dialogId: string | null;
  openDialog: (id: string) => void;
  closeDialog: () => void;
}

export const useTransactionDialogStore = create<TransactionDialogState>(
  (set) => ({
    isOpen: false,
    dialogId: null,
    openDialog: (id: string) => set({ isOpen: true, dialogId: id }),
    closeDialog: () => set({ isOpen: false, dialogId: null }),
  })
);
