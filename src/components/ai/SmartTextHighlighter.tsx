
import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

interface SmartTextHighlighterProps {
  text: string;
  aiEnhancedRanges?: Array<{
    start: number;
    end: number;
    type: 'completion' | 'suggestion' | 'correction';
    confidence?: number;
  }>;
  className?: string;
}

const SmartTextHighlighter: React.FC<SmartTextHighlighterProps> = ({
  text,
  aiEnhancedRanges = [],
  className = ''
}) => {
  const [showHighlights, setShowHighlights] = useState(false);

  useEffect(() => {
    // Show highlights briefly when AI enhancements are added
    if (aiEnhancedRanges.length > 0) {
      setShowHighlights(true);
      const timer = setTimeout(() => setShowHighlights(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [aiEnhancedRanges]);

  const getHighlightStyle = (type: string, confidence: number = 0.8) => {
    const baseStyle = 'relative transition-all duration-500 ease-out';
    const opacity = showHighlights ? 0.15 : 0.05;
    
    switch (type) {
      case 'completion':
        return `${baseStyle} bg-blue-200/[${opacity}] border-b border-blue-300/30`;
      case 'suggestion':
        return `${baseStyle} bg-green-200/[${opacity}] border-b border-green-300/30`;
      case 'correction':
        return `${baseStyle} bg-orange-200/[${opacity}] border-b border-orange-300/30`;
      default:
        return baseStyle;
    }
  };

  const renderTextWithHighlights = () => {
    if (aiEnhancedRanges.length === 0) {
      return text;
    }

    const parts = [];
    let lastIndex = 0;

    // Sort ranges by start position
    const sortedRanges = [...aiEnhancedRanges].sort((a, b) => a.start - b.start);

    sortedRanges.forEach((range, index) => {
      // Add text before this range
      if (range.start > lastIndex) {
        parts.push(text.slice(lastIndex, range.start));
      }

      // Add highlighted text
      const highlightedText = text.slice(range.start, range.end);
      parts.push(
        <span
          key={`highlight-${index}`}
          className={getHighlightStyle(range.type, range.confidence)}
          title={`AI ${range.type} (${Math.round((range.confidence || 0.8) * 100)}% confidence)`}
        >
          {highlightedText}
          {showHighlights && (
            <Sparkles className="inline-block h-3 w-3 ml-1 text-primary/40 animate-pulse" />
          )}
        </span>
      );

      lastIndex = range.end;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts;
  };

  return (
    <div className={`relative ${className}`}>
      {renderTextWithHighlights()}
    </div>
  );
};

export default SmartTextHighlighter;
