'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import Dialog from '@/components/Dialog';
import type { DialogProps } from '@/components/Dialog';

export type DialogOptions = Omit<DialogProps, 'open' | 'onConfirm' | 'onCancel'> & {
  onConfirm?: () => void;
  onCancel?: () => void;
};

interface DialogContextType {
  showDialog: (options: DialogOptions) => Promise<boolean>;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export function DialogProvider({ children }: { children: React.ReactNode }) {
  const [dialogState, setDialogState] = useState<{
    open: boolean;
    options: DialogOptions;
    resolve: ((value: boolean) => void) | null;
  }>({
    open: false,
    options: { title: '', message: '', type: 'info' },
    resolve: null,
  });

  const showDialog = useCallback((options: DialogOptions) => {
    return new Promise<boolean>((resolve) => {
      setDialogState({
        open: true,
        options,
        resolve,
      });
    });
  }, []);

  const handleConfirm = () => {
    if (dialogState.resolve) dialogState.resolve(true);
    if (dialogState.options.onConfirm) dialogState.options.onConfirm();
    setDialogState((prev) => ({
      ...prev,
      open: false,
      resolve: null,
    }));
  };

  const handleCancel = () => {
    if (dialogState.resolve) dialogState.resolve(false);
    if (dialogState.options.onCancel) dialogState.options.onCancel();
    setDialogState((prev) => ({
      ...prev,
      open: false,
      resolve: null,
    }));
  };

  return (
    <DialogContext.Provider value={{ showDialog }}>
      {children}
      <Dialog
        open={dialogState.open}
        type={dialogState.options.type}
        title={dialogState.options.title}
        message={dialogState.options.message}
        confirmLabel={dialogState.options.confirmLabel}
        cancelLabel={dialogState.options.cancelLabel}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </DialogContext.Provider>
  );
}

export function useDialog() {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
}
