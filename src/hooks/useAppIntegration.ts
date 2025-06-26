
import { useEffect } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { useWriting } from '@/contexts/WritingContext';
import { useAIContext } from '@/contexts/AIContext';
import { useDatabase } from '@/hooks/useDatabase';

export const useAppIntegration = () => {
  const { database, isInitialized } = useDatabase();
  const { state: projectState, dispatch: projectDispatch } = useProject();
  const { state: writingState, dispatch: writingDispatch } = useWriting();
  const { state: aiState, dispatch: aiDispatch } = useAIContext();

  // Initialize AI settings from database
  useEffect(() => {
    if (!isInitialized) return;

    const loadAISettings = async () => {
      try {
        const defaultProvider = await database.getSetting('default_ai_provider');
        if (defaultProvider && defaultProvider !== aiState.selectedProvider) {
          aiDispatch({ type: 'SET_PROVIDER', payload: defaultProvider });
        }

        // Load saved API keys from localStorage
        const savedKeys: Record<string, string> = {};
        const providers = ['OpenAI', 'Claude', 'Gemini', 'Custom OpenAI Compatible'];
        
        for (const provider of providers) {
          const key = localStorage.getItem(`ai-api-key-${provider}`);
          if (key) {
            savedKeys[provider] = key;
          }
        }

        if (Object.keys(savedKeys).length > 0) {
          Object.entries(savedKeys).forEach(([provider, key]) => {
            aiDispatch({ type: 'SET_API_KEY', payload: { provider, key } });
          });
        }
      } catch (error) {
        console.error('Failed to load AI settings:', error);
      }
    };

    loadAISettings();
  }, [isInitialized, database, aiState.selectedProvider, aiDispatch]);

  // Sync writing state with project state
  useEffect(() => {
    if (projectState.activeDocumentId && projectState.flatDocuments.length > 0) {
      const activeDoc = projectState.flatDocuments.find(doc => doc.id === projectState.activeDocumentId);
      if (activeDoc && (!writingState.currentDocument || writingState.currentDocument.id !== activeDoc.id)) {
        writingDispatch({
          type: 'SET_CURRENT_DOCUMENT',
          payload: {
            id: activeDoc.id,
            title: activeDoc.title,
            content: activeDoc.content || '',
            type: activeDoc.type,
            createdAt: activeDoc.createdAt,
            updatedAt: activeDoc.lastModified,
            wordCount: activeDoc.wordCount
          }
        });
      }
    }
  }, [projectState.activeDocumentId, projectState.flatDocuments, writingState.currentDocument, writingDispatch]);

  return {
    isReady: isInitialized,
    database,
    projectState,
    writingState,
    aiState
  };
};
