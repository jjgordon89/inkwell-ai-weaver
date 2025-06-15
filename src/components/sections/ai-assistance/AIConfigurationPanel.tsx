
import React, { useState } from 'react';
import { useAI } from '@/hooks/useAI';
import { useAIErrorHandler } from '@/hooks/ai/useAIErrorHandler';
import ConfigurationStatus from './ConfigurationStatus';
import GeneralSettings from './GeneralSettings';
import AdvancedParameters from './AdvancedParameters';
import TestAIConfiguration from './TestAIConfiguration';
import ConfigurationActions from './ConfigurationActions';
import AIErrorBoundary from '@/components/ai/AIErrorBoundary';

const AIConfigurationPanelContent = () => {
  const { 
    processText, 
    isProcessing, 
    selectedProvider, 
    selectedModel, 
    isCurrentProviderConfigured 
  } = useAI();
  
  const { error, clearError, retryWithErrorHandling } = useAIErrorHandler();
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

  const saveSettings = async () => {
    await retryWithErrorHandling(async () => {
      const settings = {
        autoSuggest,
        realTimeProcessing,
        maxTokens,
        temperature
      };
      localStorage.setItem('ai-configuration', JSON.stringify(settings));
      console.log('AI configuration saved:', settings);
      return true;
    }, 'validation');
  };

  // Load settings on component mount
  React.useEffect(() => {
    const loadSettings = async () => {
      await retryWithErrorHandling(async () => {
        const saved = localStorage.getItem('ai-configuration');
        if (saved) {
          const settings = JSON.parse(saved);
          setAutoSuggest(settings.autoSuggest ?? true);
          setRealTimeProcessing(settings.realTimeProcessing ?? false);
          setMaxTokens(settings.maxTokens ?? '1000');
          setTemperature(settings.temperature ?? '0.7');
        }
        return true;
      }, 'validation');
    };
    
    loadSettings();
  }, [retryWithErrorHandling]);

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

const AIConfigurationPanel = () => {
  return (
    <AIErrorBoundary>
      <AIConfigurationPanelContent />
    </AIErrorBoundary>
  );
};

export default AIConfigurationPanel;
