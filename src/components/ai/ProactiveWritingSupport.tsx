import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, AlertTriangle } from 'lucide-react';
import { useWriting } from '@/contexts/WritingContext';
import { useCollaborativeAI } from '@/hooks/useCollaborativeAI';
import { detectWritingBlocks, WritingBlock } from './proactive/WritingBlockDetector';
import WritingBlockAlert from './proactive/WritingBlockAlert';
import ChapterSummaryCard from './proactive/ChapterSummaryCard';
import ContinuityNotesCard from './proactive/ContinuityNotesCard';
import { generateContinuityNotes } from './proactive/utils';

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

  const generateChapterSummary = async (content: string) => {
    if (!content || content.length < 200) return;

    try {
      const suggestions = await generateContextualSuggestions(
        content,
        undefined,
        state.characters.map(c => c.name), // Convert Character[] to string[]
        state.storyArcs
      );
      
      // Extract summary-like suggestions
      const summaryLines = suggestions.filter((s: string) => 
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

  useEffect(() => {
    if (!isEnabled || !state.currentDocument?.content) return;

    const content = state.currentDocument.content;
    const blocks = detectWritingBlocks(content, state.characters);
    setDetectedBlocks(blocks);
    generateChapterSummary(content);
    
    const notes = generateContinuityNotes(
      content,
      state.characters,
      state.storyArcs,
      state.worldElements
    );
    setContinuityNotes(notes);
  }, [isEnabled, state.currentDocument?.content, state.characters, state.storyArcs, state.worldElements]);

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
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">Writing Assistance</span>
            </div>
            <div className="space-y-3">
              {detectedBlocks.map((block, index) => (
                <WritingBlockAlert key={index} block={block} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chapter Summary */}
      {chapterSummary && <ChapterSummaryCard summary={chapterSummary} />}

      {/* Continuity Notes */}
      {continuityNotes.length > 0 && <ContinuityNotesCard notes={continuityNotes} />}

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
