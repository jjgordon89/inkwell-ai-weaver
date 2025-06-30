import { useContext } from 'react';
import { ToastContext, ToastContextType } from '@/contexts/ToastContext';

/**
 * Custom hook to access the toast context from anywhere in the application
 */
export const useAppToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useAppToast must be used within a ToastProvider');
  }
  return context;
};
