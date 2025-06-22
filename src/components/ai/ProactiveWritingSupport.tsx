
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Brain, 
  Users, 
  ArrowRight, 
  Clock, 
  BookOpen, 
  Lightbulb,
  AlertTriangle
} from 'lucide-react';
import { useWriting } from '@/contexts/WritingContext';
import { useCollaborativeAI } from '@/hooks/useCollaborativeAI';

interface WritingBlock {
  type: 'writers_block' | 'transition_gap' | 'character_inconsistency' | 'pacing_issue';
  severity: 'low' | 'medium' | 'high';
  message: string;
  suggestions: string[];
  position?: number;
}

interface ProactiveWritingSupportProps {
  isEnabled: boolean;
  onToggle: () => void;
}

const ProactiveWritingSupport: React.FC<ProactiveWritingSupportProps> = ({
  isEnabled,
  onToggle
}) => {
  const { state } = useWriting();
  const { generateContextualSuggestions, isAnalyzing } = useCollaborativeAI();
  const [detectedBlocks, setDetectedBlocks] = useState<WritingBlock[]>([]);
  const [chapterSummary, setChapterSummary] = useState<string>('');
  const [continuityNotes, setContinuityNotes] = useState<string[]>([]);

  const detectWritingBlocks = (content: string): WritingBlock[] => {
    const blocks: WritingBlock[] = [];
    
    // Detect writer's block (short paragraphs, repetitive patterns)
    const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);
    const shortParagraphs = paragraphs.filter(p => p.length < 50);
    
    if (shortParagraphs.length > paragraphs.length * 0.6) {
      blocks.push({
        type: 'writers_block',
        severity: 'medium',
        message: 'Detected short paragraphs that might indicate writer\'s block',
        suggestions: [
          'Try expanding on character emotions and motivations',
          'Add sensory details to create immersion',
          'Explore the setting and atmosphere',
          'Consider character dialogue to advance the plot'
        ]
      });
    }

    // Detect transition gaps (abrupt scene changes)
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const timeWords = ['suddenly', 'meanwhile', 'later', 'next', 'then'];
    const abruptTransitions = sentences.filter(s => 
      timeWords.some(word => s.toLowerCase().includes(word))
    );

    if (abruptTransitions.length > sentences.length * 0.1) {
      blocks.push({
        type: 'transition_gap',
        severity: 'low',
        message: 'Detected potential abrupt scene transitions',
        suggestions: [
          'Add transitional descriptions between scenes',
          'Show character reactions to scene changes',
          'Include time and location anchors',
          'Bridge scenes with character thoughts or actions'
        ]
      });
    }

    // Character consistency check
    const characterNames = state.characters.map(c => c.name.toLowerCase());
    const mentionedCharacters = characterNames.filter(name => 
      content.toLowerCase().includes(name)
    );

    if (mentionedCharacters.length > 0 && mentionedCharacters.length !== state.characters.length) {
      blocks.push({
        type: 'character_inconsistency',
        severity: 'medium',
        message: 'Some established characters are missing from this content',
        suggestions: [
          'Consider including reactions from all main characters',
          'Check if missing characters should be present in this scene',
          'Add character interactions to maintain presence',
          'Reference missing characters through dialogue or thoughts'
        ]
      });
    }

    return blocks;
  };

  const generateChapterSummary = async (content: string) => {
    if (!content || content.length < 200) return;

    try {
      const suggestions = await generateContextualSuggestions(
        content,
        undefined,
        state.characters,
        state.storyArcs
      );
      
      // Extract summary-like suggestions
      const summaryLines = suggestions.filter(s => 
        s.toLowerCase().includes('summary') || 
        s.toLowerCase().includes('chapter') ||
        s.toLowerCase().includes('key events')
      );
      
      if (summaryLines.length > 0) {
        setChapterSummary(summaryLines[0]);
      }
    } catch (error) {
      console.error('Failed to generate chapter summary:', error);
    }
  };

  const generateContinuityNotes = (content: string) => {
    const notes: string[] = [];
    
    // Check for character mentions
    state.characters.forEach(character => {
      if (content.toLowerCase().includes(character.name.toLowerCase())) {
        notes.push(`${character.name} appears in this section`);
      }
    });

    // Check for story arc progression
    state.storyArcs.forEach(arc => {
      if (content.toLowerCase().includes(arc.title.toLowerCase())) {
        notes.push(`Story arc "${arc.title}" progresses here`);
      }
    });

    // Check for world elements
    state.worldElements.forEach(element => {
      if (content.toLowerCase().includes(element.name.toLowerCase())) {
        notes.push(`References ${element.type} "${element.name}"`);
      }
    });

    setContinuityNotes(notes);
  };

  useEffect(() => {
    if (!isEnabled || !state.currentDocument?.content) return;

    const content = state.currentDocument.content;
    const blocks = detectWritingBlocks(content);
    setDetectedBlocks(blocks);
    generateChapterSummary(content);
    generateContinuityNotes(content);
  }, [isEnabled, state.currentDocument?.content, state.characters, state.storyArcs, state.worldElements]);

  const getBlockIcon = (type: string) => {
    switch (type) {
      case 'writers_block': return <Brain className="h-4 w-4" />;
      case 'transition_gap': return <ArrowRight className="h-4 w-4" />;
      case 'character_inconsistency': return <Users className="h-4 w-4" />;
      case 'pacing_issue': return <Clock className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (!isEnabled) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <Brain className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-3">
              Enable proactive writing support for real-time assistance
            </p>
            <Button onClick={onToggle} size="sm">
              <Brain className="h-4 w-4 mr-2" />
              Enable Support
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <span className="font-medium">Proactive Writing Support</span>
          <Badge variant="outline" className="text-xs">Active</Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={onToggle}>
          Disable
        </Button>
      </div>

      {/* Writing Blocks Detection */}
      {detectedBlocks.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Writing Assistance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {detectedBlocks.map((block, index) => (
              <Alert key={index} className={getSeverityColor(block.severity)}>
                <div className="flex items-start gap-2">
                  {getBlockIcon(block.type)}
                  <div className="flex-1">
                    <AlertDescription className="text-sm font-medium mb-2">
                      {block.message}
                    </AlertDescription>
                    <div className="space-y-1">
                      {block.suggestions.slice(0, 2).map((suggestion, idx) => (
                        <div key={idx} className="text-xs flex items-center gap-1">
                          <Lightbulb className="h-3 w-3" />
                          {suggestion}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Chapter Summary */}
      {chapterSummary && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Auto-Generated Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{chapterSummary}</p>
          </CardContent>
        </Card>
      )}

      {/* Continuity Notes */}
      {continuityNotes.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Continuity Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {continuityNotes.map((note, index) => (
                <div key={index} className="text-xs text-muted-foreground flex items-center gap-1">
                  <span className="w-1 h-1 bg-primary rounded-full" />
                  {note}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {detectedBlocks.length === 0 && !chapterSummary && continuityNotes.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center">
            <Brain className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {isAnalyzing ? 'Analyzing your writing...' : 'Keep writing to get proactive suggestions'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProactiveWritingSupport;
