
import React, { useEffect, useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertTriangle, Lightbulb, Users, BookOpen } from 'lucide-react';

interface TextIssue {
  id: string;
  start: number;
  end: number;
  type: 'grammar' | 'style' | 'character' | 'plot' | 'pacing';
  severity: 'low' | 'medium' | 'high';
  message: string;
  suggestion?: string;
}

interface SmartTextHighlighterProps {
  content: string;
  onIssueClick: (issue: TextIssue) => void;
  isEnabled: boolean;
}

const SmartTextHighlighter: React.FC<SmartTextHighlighterProps> = ({
  content,
  onIssueClick,
  isEnabled
}) => {
  const [issues, setIssues] = useState<TextIssue[]>([]);
  const [highlightedContent, setHighlightedContent] = useState<React.ReactNode[]>([]);

  const detectIssues = (text: string): TextIssue[] => {
    const detectedIssues: TextIssue[] = [];
    
    // Simple pattern-based detection (in real app, this would use AI)
    const patterns = [
      {
        regex: /\b(very|really|quite|rather)\s+(\w+)/gi,
        type: 'style' as const,
        severity: 'low' as const,
        message: 'Consider using a stronger adjective instead of modifier + adjective'
      },
      {
        regex: /\b(he|she|it)\s+(said|replied|answered)\b/gi,
        type: 'style' as const,
        severity: 'medium' as const,
        message: 'Consider using more descriptive dialogue tags'
      },
      {
        regex: /\b(\w+)\s+\1\b/gi,
        type: 'style' as const,
        severity: 'medium' as const,
        message: 'Repeated word detected'
      },
      {
        regex: /[.!?]\s+[a-z]/g,
        type: 'grammar' as const,
        severity: 'high' as const,
        message: 'Sentence should start with capital letter'
      }
    ];

    patterns.forEach((pattern, index) => {
      let match;
      while ((match = pattern.regex.exec(text)) !== null) {
        detectedIssues.push({
          id: `issue-${index}-${match.index}`,
          start: match.index,
          end: match.index + match[0].length,
          type: pattern.type,
          severity: pattern.severity,
          message: pattern.message,
          suggestion: generateSuggestion(match[0], pattern.type)
        });
      }
    });

    return detectedIssues;
  };

  const generateSuggestion = (text: string, type: string): string => {
    // Simple suggestion generation
    switch (type) {
      case 'style':
        if (text.includes('very')) {
          return text.replace(/very\s+(\w+)/i, (_, word) => {
            const alternatives: Record<string, string> = {
              'good': 'excellent',
              'bad': 'terrible',
              'big': 'enormous',
              'small': 'tiny'
            };
            return alternatives[word.toLowerCase()] || word;
          });
        }
        break;
      case 'grammar':
        return text.charAt(0).toUpperCase() + text.slice(1);
    }
    return text;
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'character': return <Users className="h-3 w-3" />;
      case 'plot': return <BookOpen className="h-3 w-3" />;
      case 'grammar': return <AlertTriangle className="h-3 w-3" />;
      default: return <Lightbulb className="h-3 w-3" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-200 border-red-400';
      case 'medium': return 'bg-yellow-200 border-yellow-400';
      case 'low': return 'bg-blue-200 border-blue-400';
      default: return 'bg-gray-200 border-gray-400';
    }
  };

  useEffect(() => {
    if (!isEnabled || !content) {
      setHighlightedContent([content]);
      return;
    }

    const detectedIssues = detectIssues(content);
    setIssues(detectedIssues);

    // Create highlighted content
    const highlighted: React.ReactNode[] = [];
    let lastIndex = 0;

    // Sort issues by start position
    const sortedIssues = [...detectedIssues].sort((a, b) => a.start - b.start);

    sortedIssues.forEach((issue, index) => {
      // Add text before the issue
      if (issue.start > lastIndex) {
        highlighted.push(content.slice(lastIndex, issue.start));
      }

      // Add highlighted issue
      const issueText = content.slice(issue.start, issue.end);
      highlighted.push(
        <TooltipProvider key={`issue-${index}`}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className={`inline-block px-1 rounded border-b-2 cursor-pointer transition-colors hover:bg-opacity-70 ${getSeverityColor(issue.severity)}`}
                onClick={() => onIssueClick(issue)}
              >
                {issueText}
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  {getIssueIcon(issue.type)}
                  <Badge variant="outline" className="text-xs">
                    {issue.type}
                  </Badge>
                </div>
                <p className="text-xs">{issue.message}</p>
                {issue.suggestion && (
                  <p className="text-xs font-medium">
                    Suggestion: "{issue.suggestion}"
                  </p>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      lastIndex = issue.end;
    });

    // Add remaining text
    if (lastIndex < content.length) {
      highlighted.push(content.slice(lastIndex));
    }

    setHighlightedContent(highlighted);
  }, [content, isEnabled]);

  return <>{highlightedContent}</>;
};

export default SmartTextHighlighter;
