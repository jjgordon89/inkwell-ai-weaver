
import React from 'react';
import SmartTextCompletion from '@/components/ai/SmartTextCompletion';
import InlineAISuggestions from '@/components/ai/InlineAISuggestions';
import WorkflowAIIntegration from '@/components/editor/WorkflowAIIntegration';
import type { AISuggestion } from '@/hooks/collaborative-ai/types';

interface EditorAIComponentsProps {
  activeDocument: any;
  selectedText: string;
  selectionPosition: { x: number; y: number };
  showInlineSuggestions: boolean;
  suggestions: AISuggestion[];
  onContentChange: (newContent: string) => void;
  onApplyAISuggestion: (newText: string) => void;
  onDismissInlineSuggestions: () => void;
}

const EditorAIComponents: React.FC<EditorAIComponentsProps> = ({
  activeDocument,
  selectedText,
  selectionPosition,
  showInlineSuggestions,
  suggestions,
  onContentChange,
  onApplyAISuggestion,
  onDismissInlineSuggestions
}) => {
  return (
    <>
      {/* Smart Text Completion */}
      <SmartTextCompletion
        textBefore={activeDocument?.content?.slice(-100) || ''}
        textAfter=""
        cursorPosition={0}
        onAccept={(completion) => {
          onContentChange((activeDocument?.content || '') + completion);
        }}
        onDismiss={() => {}}
        isEnabled={true}
      />

      {/* Inline AI Suggestions for Selected Text */}
      {showInlineSuggestions && selectedText && (
        <InlineAISuggestions
          selectedText={selectedText}
          onApply={onApplyAISuggestion}
          onDismiss={onDismissInlineSuggestions}
          position={selectionPosition}
          documentContent={activeDocument?.content || ''}
        />
      )}

      {/* Workflow AI Integration */}
      <WorkflowAIIntegration
        selectedText={selectedText}
        suggestions={suggestions.map(s => s.text)}
        isVisible={!!activeDocument}
      />
    </>
  );
};

export default EditorAIComponents;
