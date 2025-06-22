
import React from 'react';
import InlineAISuggestions from '@/components/ai/InlineAISuggestions';
import AIAssistantOverlay from '@/components/ai/AIAssistantOverlay';
import ProactiveWritingSupport from '@/components/ai/ProactiveWritingSupport';
import SuggestionsPanel from '@/components/ai/SuggestionsPanel';
import ContextualSuggestions from '@/components/ai/ContextualSuggestions';

interface ContextualSuggestion {
  id: string;
  type: 'writing_block' | 'character_dialogue' | 'structure' | 'general';
  message: string;
  priority: 'low' | 'medium' | 'high';
  actionable?: boolean;
}

interface EditorAIPanelsProps {
  // Contextual suggestions
  contextualSuggestions: ContextualSuggestion[];
  cursorPosition: { x: number; y: number };
  onDismissContextualSuggestion: (id: string) => void;
  onApplyContextualSuggestion: (suggestion: ContextualSuggestion) => void;
  
  // Suggestions panel
  suggestions: any[];
  showSuggestionsPanel: boolean;
  onCloseSuggestionsPanel: () => void;
  onApplySuggestionFromPanel: (suggestion: any) => void;
  
  // Proactive panel
  showProactivePanel: boolean;
  proactiveEnabled: boolean;
  onToggleProactive: () => void;
  
  // Inline suggestions
  showInlineSuggestions: boolean;
  selectedText: string;
  selectionPosition: { x: number; y: number };
  currentDocument: any;
  onApplyAISuggestion: (text: string) => void;
  onDismissInlineSuggestions: () => void;
  setSelectedText: (text: string) => void;
}

const EditorAIPanels: React.FC<EditorAIPanelsProps> = ({
  contextualSuggestions,
  cursorPosition,
  onDismissContextualSuggestion,
  onApplyContextualSuggestion,
  suggestions,
  showSuggestionsPanel,
  onCloseSuggestionsPanel,
  onApplySuggestionFromPanel,
  showProactivePanel,
  proactiveEnabled,
  onToggleProactive,
  showInlineSuggestions,
  selectedText,
  selectionPosition,
  currentDocument,
  onApplyAISuggestion,
  onDismissInlineSuggestions,
  setSelectedText
}) => {
  return (
    <>
      {/* Contextual AI Suggestions - Now less intrusive */}
      <ContextualSuggestions
        suggestions={contextualSuggestions}
        onDismiss={onDismissContextualSuggestion}
        onApplyAction={onApplyContextualSuggestion}
        isVisible={contextualSuggestions.length > 0}
        position={cursorPosition}
      />

      {/* AI Suggestions Panel */}
      <SuggestionsPanel
        suggestions={suggestions}
        isVisible={showSuggestionsPanel}
        onClose={onCloseSuggestionsPanel}
        onApplySuggestion={onApplySuggestionFromPanel}
        onDismissSuggestion={(id) => suggestions.find(s => s.id === id) && onApplySuggestionFromPanel(suggestions.find(s => s.id === id)!)}
      />

      {/* Proactive Writing Support Panel */}
      {showProactivePanel && (
        <div className="w-80 border-l bg-background/50 backdrop-blur-sm overflow-y-auto">
          <div className="p-4">
            <ProactiveWritingSupport
              isEnabled={proactiveEnabled}
              onToggle={onToggleProactive}
            />
          </div>
        </div>
      )}
      
      {/* Inline AI Suggestions for Selected Text */}
      {showInlineSuggestions && selectedText && (
        <InlineAISuggestions
          selectedText={selectedText}
          onApply={onApplyAISuggestion}
          onDismiss={onDismissInlineSuggestions}
          position={selectionPosition}
          documentContent={currentDocument.content || ''}
        />
      )}
      
      {/* AI Assistant Overlay */}
      <AIAssistantOverlay />
    </>
  );
};

export default EditorAIPanels;
