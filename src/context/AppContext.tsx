import { createContext, useContext, useRef, type ReactNode } from 'react';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';

interface AppContextType {
    showToast: (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => void;
    confirmAction: (message: string, header: string, onConfirm: () => void) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
    const toast = useRef<Toast>(null);

    const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    const confirmAction = (message: string, header: string, onConfirm: () => void) => {
        confirmDialog({
            message,
            header,
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Да, изтрий',
            rejectLabel: 'Отказ',
            acceptClassName: 'p-button-danger',
            accept: onConfirm
        });
    };

    return (
        <AppContext.Provider value={{ showToast, confirmAction }}>
            <Toast ref={toast} position="top-right" />
            <ConfirmDialog />
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("useApp трябва да се използва вътре в AppProvider");
    }
    return context;
};