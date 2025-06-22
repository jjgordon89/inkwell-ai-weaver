
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, FileText, Users, BookOpen, Target } from 'lucide-react';
import { useWriting } from '@/contexts/WritingContext';
import OneClickActions from './OneClickActions';
import BatchProcessor from './BatchProcessor';

interface ContextInfo {
  type: 'empty' | 'beginning' | 'middle' | 'ending' | 'complete';
  focus: 'character' | 'plot' | 'setting' | 'dialogue' | 'general';
  suggestions: string[];
  priority: 'high' | 'medium' | 'low';
}

const ContextAwareAIPanel: React.FC = () => {
  const { state } = useWriting();

  const contextInfo = useMemo((): ContextInfo => {
    const content = state.currentDocument?.content || '';
    const wordCount = content.split(' ').length;
    const characterCount = state.characters.length;
    const storyArcCount = state.storyArcs.length;

    // Determine document stage
    let type: ContextInfo['type'] = 'empty';
    if (wordCount === 0) {
      type = 'empty';
    } else if (wordCount < 500) {
      type = 'beginning';
    } else if (wordCount < 2000) {
      type = 'middle';
    } else if (wordCount < 5000) {
      type = 'ending';
    } else {
      type = 'complete';
    }

    // Determine focus area
    let focus: ContextInfo['focus'] = 'general';
    if (content.includes('"') && content.split('"').length > 4) {
      focus = 'dialogue';
    } else if (characterCount > 0 && content.includes('character')) {
      focus = 'character';
    } else if (storyArcCount > 0 || content.includes('plot')) {
      focus = 'plot';
    } else if (content.includes('setting') || content.includes('location')) {
      focus = 'setting';
    }

    // Generate context-specific suggestions
    const suggestions = generateContextSuggestions(type, focus, wordCount, characterCount);

    // Determine priority
    const priority: ContextInfo['priority'] = 
      type === 'empty' || type === 'beginning' ? 'high' :
      type === 'middle' ? 'medium' : 'low';

    return { type, focus, suggestions, priority };
  }, [state.currentDocument, state.characters, state.storyArcs]);

  const generateContextSuggestions = (
    type: ContextInfo['type'],
    focus: ContextInfo['focus'],
    wordCount: number,
    characterCount: number
  ): string[] => {
    const baseSuggestions = {
      empty: [
        'Start with a compelling opening line',
        'Introduce your main character',
        'Set the scene and atmosphere',
        'Begin with dialogue or action'
      ],
      beginning: [
        'Develop your protagonist further',
        'Introduce conflict or tension',
        'Add sensory details to scenes',
        'Consider the story\'s central question'
      ],
      middle: [
        'Raise the stakes for your characters',
        'Add complications to the plot',
        'Develop subplots and relationships',
        'Build toward the climax'
      ],
      ending: [
        'Resolve major plot threads',
        'Show character growth and change',
        'Provide emotional satisfaction',
        'Consider the story\'s message'
      ],
      complete: [
        'Review for consistency and pacing',
        'Polish dialogue and descriptions',
        'Check character arcs for completeness',
        'Consider themes and symbolism'
      ]
    };

    const focusSuggestions = {
      character: [
        'Deepen character motivations',
        'Add character backstory elements',
        'Show character relationships'
      ],
      plot: [
        'Increase narrative tension',
        'Add plot twists or surprises',
        'Connect story events more clearly'
      ],
      setting: [
        'Enhance world-building details',
        'Use setting to reflect mood',
        'Make locations feel authentic'
      ],
      dialogue: [
        'Ensure each character has a unique voice',
        'Use dialogue to advance plot',
        'Add subtext to conversations'
      ],
      general: [
        'Improve sentence variety',
        'Strengthen word choices',
        'Enhance narrative flow'
      ]
    };

    return [
      ...baseSuggestions[type],
      ...focusSuggestions[focus]
    ].slice(0, 6);
  };

  const getContextIcon = (focus: ContextInfo['focus']) => {
    switch (focus) {
      case 'character': return <Users className="h-4 w-4" />;
      case 'plot': return <BookOpen className="h-4 w-4" />;
      case 'setting': return <Target className="h-4 w-4" />;
      case 'dialogue': return <FileText className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const getTypeDescription = (type: ContextInfo['type']) => {
    switch (type) {
      case 'empty': return 'Ready to start writing';
      case 'beginning': return 'Building the foundation';
      case 'middle': return 'Developing the story';
      case 'ending': return 'Moving toward resolution';
      case 'complete': return 'Polishing and refining';
    }
  };

  const getPriorityColor = (priority: ContextInfo['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
    }
  };

  return (
    <div className="space-y-4">
      {/* Context Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Context Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getContextIcon(contextInfo.focus)}
              <span className="text-sm font-medium">
                {contextInfo.focus.charAt(0).toUpperCase() + contextInfo.focus.slice(1)} Focus
              </span>
            </div>
            <Badge 
              variant="outline" 
              className={`text-xs ${getPriorityColor(contextInfo.priority)}`}
            >
              {contextInfo.priority} priority
            </Badge>
          </div>
          
          <div className="text-xs text-muted-foreground">
            Status: {getTypeDescription(contextInfo.type)}
          </div>
          
          {state.currentDocument && (
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span>{state.currentDocument.content?.split(' ').length || 0} words</span>
              <span>{state.characters.length} characters</span>
              <span>{state.storyArcs.length} story arcs</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* One-Click Actions */}
      <OneClickActions />

      {/* Batch Processor */}
      <BatchProcessor 
        suggestions={contextInfo.suggestions}
        onBatchComplete={() => console.log('Batch processing complete')}
      />
    </div>
  );
};

export default ContextAwareAIPanel;
