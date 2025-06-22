
import React, { useState, useEffect } from 'react';
import { useWriting } from '@/contexts/WritingContext';
import SmartTextHighlighter from '@/components/ai/SmartTextHighlighter';
import FloatingAIStatus from '@/components/ai/FloatingAIStatus';
import ImprovedAIOverlay from '@/components/ai/ImprovedAIOverlay';
import { useSmoothTransitions } from '@/hooks/useSmoothTransitions';

interface VisualAIIntegrationProps {
  children: React.ReactNode;
  suggestions: any[];
  isAnalyzing: boolean;
  selectedText: string;
  onApplySuggestion: (suggestion: any) => void;
  onDismissSuggestion: (id: string) => void;
  onImproveSelection: () => void;
}

const VisualAIIntegration: React.FC<VisualAIIntegrationProps> = ({
  children,
  suggestions,
  isAnalyzing,
  selectedText,
  onApplySuggestion,
  onDismissSuggestion,
  onImproveSelection
}) => {
  const { state } = useWriting();
  const [showAIOverlay, setShowAIOverlay] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [aiActivity, setAiActivity] = useState<any>({ type: 'idle' });
  const transition = useSmoothTransitions();

  // Track AI activity
  useEffect(() => {
    if (isAnalyzing) {
      setAiActivity({
        type: 'analyzing',
        message: 'Analyzing your writing...',
        progress: undefined
      });
    } else if (suggestions.length > 0) {
      setAiActivity({
        type: 'suggesting',
        message: `${suggestions.length} suggestions available`,
        progress: undefined
      });
    } else {
      setAiActivity({
        type: 'idle',
        message: 'Ready to assist'
      });
    }
  }, [isAnalyzing, suggestions.length]);

  // Show overlay when there are suggestions or selected text
  useEffect(() => {
    const shouldShow = (suggestions.length > 0 || selectedText.length > 0) && !isAnalyzing;
    setShowAIOverlay(shouldShow);
    
    if (shouldShow) {
      transition.show(200);
    } else {
      transition.hide();
    }
  }, [suggestions.length, selectedText, isAnalyzing, transition]);

  // Track cursor position for better overlay positioning
  const handleMouseMove = (e: React.MouseEvent) => {
    setCursorPosition({ x: e.clientX, y: e.clientY });
  };

  // Get AI enhanced ranges for text highlighting
  const getAIEnhancedRanges = () => {
    if (!state.currentDocument?.content) return [];
    
    // This would be populated by actual AI enhancement tracking
    // For now, return empty array as this requires integration with AI services
    return [];
  };

  return (
    <div 
      className="relative h-full w-full"
      onMouseMove={handleMouseMove}
    >
      {/* Main content with AI highlighting */}
      <SmartTextHighlighter
        text={state.currentDocument?.content || ''}
        aiEnhancedRanges={getAIEnhancedRanges()}
        className="h-full w-full"
      >
        {children}
      </SmartTextHighlighter>

      {/* Floating AI Status Indicator */}
      <FloatingAIStatus
        activity={aiActivity}
        suggestions={suggestions.length}
        isVisible={!showAIOverlay}
        onToggleDetails={() => setShowAIOverlay(true)}
      />

      {/* Improved AI Overlay */}
      <ImprovedAIOverlay
        isVisible={showAIOverlay}
        suggestions={suggestions}
        selectedText={selectedText}
        isAnalyzing={isAnalyzing}
        position={cursorPosition}
        onClose={() => setShowAIOverlay(false)}
        onApplySuggestion={onApplySuggestion}
        onDismissSuggestion={onDismissSuggestion}
        onImproveSelection={onImproveSelection}
      />
    </div>
  );
};

export default VisualAIIntegration;
