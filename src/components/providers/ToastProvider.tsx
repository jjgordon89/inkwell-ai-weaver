import React, { ReactNode } from 'react';
import { ToastAction } from '@/components/ui/toast';
import { useToast } from '@/hooks/use-toast';
import { ToastContext, ShowToastProps } from '@/contexts/ToastContext';

interface ToastProviderProps {
  children: ReactNode;
}

/**
 * ToastProvider component provides a simplified interface for showing toast
 * notifications throughout the application.
 */
export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const { toast } = useToast();

  const showToast = ({
    title,
    description,
    variant = 'default',
    duration,
    action
  }: ShowToastProps) => {
    toast({
      title,
      description,
      variant,
      duration,
      action: action
        ? <ToastAction altText={action.label} onClick={action.onClick}>
            {action.label}
          </ToastAction>
        : undefined
    });
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export default ToastProvider;
