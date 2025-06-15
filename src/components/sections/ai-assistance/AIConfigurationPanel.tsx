
import React, { useState } from 'react';
import { useAI } from '@/hooks/useAI';
import ConfigurationStatus from './ConfigurationStatus';
import GeneralSettings from './GeneralSettings';
import AdvancedParameters from './AdvancedParameters';
import TestAIConfiguration from './TestAIConfiguration';
import ConfigurationActions from './ConfigurationActions';

const AIConfigurationPanel = () => {
  const { 
    processText, 
    isProcessing, 
    selectedProvider, 
    selectedModel, 
    isCurrentProviderConfigured 
  } = useAI();
  
  const [autoSuggest, setAutoSuggest] = useState(true);
  const [realTimeProcessing, setRealTimeProcessing] = useState(false);
  const [maxTokens, setMaxTokens] = useState('1000');
  const [temperature, setTemperature] = useState('0.7');

  const resetSettings = () => {
    setAutoSuggest(true);
    setRealTimeProcessing(false);
    setMaxTokens('1000');
    setTemperature('0.7');
  };

  const saveSettings = () => {
    const settings = {
      autoSuggest,
      realTimeProcessing,
      maxTokens,
      temperature
    };
    localStorage.setItem('ai-configuration', JSON.stringify(settings));
    console.log('AI configuration saved:', settings);
  };

  // Load settings on component mount
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('ai-configuration');
      if (saved) {
        const settings = JSON.parse(saved);
        setAutoSuggest(settings.autoSuggest ?? true);
        setRealTimeProcessing(settings.realTimeProcessing ?? false);
        setMaxTokens(settings.maxTokens ?? '1000');
        setTemperature(settings.temperature ?? '0.7');
      }
    } catch (error) {
      console.error('Failed to load AI configuration:', error);
    }
  }, []);

  return (
    <div className="space-y-4">
      <ConfigurationStatus
        isCurrentProviderConfigured={isCurrentProviderConfigured}
        selectedProvider={selectedProvider}
        selectedModel={selectedModel}
      />

      <GeneralSettings
        autoSuggest={autoSuggest}
        setAutoSuggest={setAutoSuggest}
        realTimeProcessing={realTimeProcessing}
        setRealTimeProcessing={setRealTimeProcessing}
      />

      <AdvancedParameters
        maxTokens={maxTokens}
        setMaxTokens={setMaxTokens}
        temperature={temperature}
        setTemperature={setTemperature}
      />

      <TestAIConfiguration
        processText={processText}
        isProcessing={isProcessing}
        isCurrentProviderConfigured={isCurrentProviderConfigured}
      />

      <ConfigurationActions
        onSave={saveSettings}
        onReset={resetSettings}
      />
    </div>
  );
};

export default AIConfigurationPanel;
