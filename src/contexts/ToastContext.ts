import { createContext } from 'react';

export interface ShowToastProps {
  title?: string;
  description: string;
  variant?: 'default' | 'destructive';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ToastContextType {
  showToast: (props: ShowToastProps) => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);
