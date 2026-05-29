'use client';

import React from 'react';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';

export interface DialogProps {
  open: boolean;
  type?: 'confirmation' | 'info' | 'warning';
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

export default function Dialog({
  open,
  type = 'info',
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: DialogProps) {
  if (!open) return null;

  // Icons and visual accents matching dialog types
  let iconElement = <Info className="w-5 h-5 text-primary" />;
  let accentBorder = 'border-primary/20';
  let primaryBtnBg = 'bg-primary text-primary-foreground hover:opacity-90';
  
  if (type === 'confirmation') {
    iconElement = <AlertTriangle className="w-5 h-5 text-destructive" />;
    accentBorder = 'border-destructive/20';
    primaryBtnBg = 'bg-destructive text-destructive-foreground hover:opacity-90';
  } else if (type === 'warning') {
    iconElement = <AlertCircle className="w-5 h-5 text-warning" />;
    accentBorder = 'border-warning/20';
    primaryBtnBg = 'bg-warning text-warning-foreground hover:opacity-95';
  }

  // Determine button labels
  const finalConfirmLabel = confirmLabel || (type === 'info' ? 'OK' : 'Confirm');
  const finalCancelLabel = cancelLabel || 'Cancel';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
    >
      <div className={`bg-card border ${accentBorder} rounded-2xl shadow-2xl p-6 w-full max-w-sm flex flex-col gap-6`}>
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-xl bg-muted shrink-0 flex items-center justify-center">
            {iconElement}
          </div>
          <div className="flex flex-col gap-1.5">
            <h2 id="dialog-title" className="text-lg font-bold text-foreground">
              {title}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          {type !== 'info' && onCancel && (
            <button
              type="button"
              aria-label={finalCancelLabel}
              onClick={onCancel}
              className="px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              {finalCancelLabel}
            </button>
          )}
          <button
            type="button"
            aria-label={finalConfirmLabel}
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${primaryBtnBg}`}
          >
            {finalConfirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
