
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AISettingsContextType {
  isSettingsOpen: boolean;
  defaultTab: string;
  openSettings: (tab?: string) => void;
  closeSettings: () => void;
}

const AISettingsContext = createContext<AISettingsContextType | undefined>(undefined);

interface AISettingsProviderProps {
  children: ReactNode;
}

export const AISettingsProvider = ({ children }: AISettingsProviderProps) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [defaultTab, setDefaultTab] = useState('overview');

  const openSettings = (tab: string = 'overview') => {
    setDefaultTab(tab);
    setIsSettingsOpen(true);
  };

  const closeSettings = () => {
    setIsSettingsOpen(false);
    setDefaultTab('overview');
  };

  return (
    <AISettingsContext.Provider value={{
      isSettingsOpen,
      defaultTab,
      openSettings,
      closeSettings
    }}>
      {children}
    </AISettingsContext.Provider>
  );
};

export const useAISettings = () => {
  const context = useContext(AISettingsContext);
  if (context === undefined) {
    throw new Error('useAISettings must be used within an AISettingsProvider');
  }
  return context;
};
