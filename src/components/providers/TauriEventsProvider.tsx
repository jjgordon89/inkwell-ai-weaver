import React, { ReactNode } from 'react';
import { useTauriEvents } from '@/hooks/useTauriEvents';

interface TauriEventsProviderProps {
  children: ReactNode;
}

/**
 * Provider that sets up Tauri event listeners for real-time UI updates
 */
export const TauriEventsProvider: React.FC<TauriEventsProviderProps> = ({ children }) => {
  // Use the hook to setup all event listeners
  useTauriEvents();
  
  // Simply render children - this component is just for setting up event listeners
  return <>{children}</>;
};

export default TauriEventsProvider;
