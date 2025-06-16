import React, { createContext, useContext, useState } from 'react';

interface AISettingsContextType {
  isSettingsOpen: boolean;
  openSettings: (tab?: string) => void;
  closeSettings: () => void;
  defaultTab: string;
}

const AISettingsContext = createContext<AISettingsContextType | undefined>(undefined);

export const useAISettings = () => {
  const context = useContext(AISettingsContext);
  if (!context) {
    throw new Error('useAISettings must be used within an AISettingsProvider');
  }
  return context;
};

interface AISettingsProviderProps {
  children: React.ReactNode;
}

export const AISettingsProvider: React.FC<AISettingsProviderProps> = ({ children }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [defaultTab, setDefaultTab] = useState('overview');

  const openSettings = (tab = 'overview') => {
    setDefaultTab(tab);
    setIsSettingsOpen(true);
  };

  const closeSettings = () => {
    setIsSettingsOpen(false);
    setDefaultTab('overview');
  };

  return (
    <AISettingsContext.Provider 
      value={{ 
        isSettingsOpen, 
        openSettings, 
        closeSettings, 
        defaultTab 
      }}
    >
      {children}
    </AISettingsContext.Provider>
  );
};
