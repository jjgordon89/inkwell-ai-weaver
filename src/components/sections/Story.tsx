
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, FileText, Clock, Target, BookOpen, Loader2 } from 'lucide-react';
import { useWriting } from '@/contexts/WritingContext';
import { useAI } from '@/hooks/useAI';
import { useToast } from "@/hooks/use-toast";

const Story = () => {
  const { state, updateDocument } = useWriting();
  const { generateSuggestions, processText, isProcessing } = useAI();
  const { toast } = useToast();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [lastSuggestionTime, setLastSuggestionTime] = useState<Date | null>(null);
  const [processingAction, setProcessingAction] = useState<string | null>(null);

  const handleGenerateSuggestions = async () => {
    if (!state.currentDocument) return;
    
    try {
      const newSuggestions = await generateSuggestions(state.currentDocument.content);
      setSuggestions(newSuggestions);
      setLastSuggestionTime(new Date());
      toast({
        title: "Suggestions Generated",
        description: `Generated ${newSuggestions.length} writing suggestions`,
      });
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
      toast({
        title: "Error",
        description: "Failed to generate suggestions. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleQuickAction = async (action: 'improve' | 'fix-grammar' | 'expand' | 'shorten') => {
    if (!state.selectedText || !state.currentDocument) return;
    
    setProcessingAction(action);
    
    try {
      const processedText = await processText(state.selectedText, action);
      
      // Replace the selected text in the document
      const updatedContent = state.currentDocument.content.replace(state.selectedText, processedText);
      
      updateDocument(state.currentDocument.id, {
        content: updatedContent,
        lastModified: new Date()
      });
      
      toast({
        title: "Text Processed",
        description: `Successfully ${action === 'fix-grammar' ? 'fixed grammar' : action === 'improve' ? 'improved' : action === 'expand' ? 'expanded' : 'shortened'} the selected text`,
      });
    } catch (error) {
      console.error(`Failed to ${action} text:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action} text. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setProcessingAction(null);
    }
  };

  const getWritingStats = () => {
    if (!state.currentDocument) return { words: 0, characters: 0, sentences: 0 };
    
    const content = state.currentDocument.content;
    const words = content.trim().split(/\s+/).filter(Boolean).length;
    const characters = content.length;
    const sentences = content.split(/[.!?]+/).filter(Boolean).length;
    
    return { words, characters, sentences };
  };

  const stats = getWritingStats();

  return (
    <div className="h-full flex flex-col bg-background p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BookOpen className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Story</h2>
        </div>
        {state.currentDocument && (
          <Badge variant="outline" className="text-sm">
            {state.currentDocument.title}
          </Badge>
        )}
      </div>

      <div className="space-y-6 flex-grow overflow-auto">
        {/* Writing Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Writing Statistics
            </CardTitle>
            <CardDescription>
              Current document metrics and progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stats.words}</div>
                <div className="text-sm text-muted-foreground">Words</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stats.characters}</div>
                <div className="text-sm text-muted-foreground">Characters</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stats.sentences}</div>
                <div className="text-sm text-muted-foreground">Sentences</div>
              </div>
            </div>
            {state.currentDocument && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Last modified: {state.currentDocument.lastModified.toLocaleString()}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Writing Suggestions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              AI Writing Suggestions
            </CardTitle>
            <CardDescription>
              Get AI-powered suggestions to enhance your writing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleGenerateSuggestions}
              disabled={isProcessing || !state.currentDocument}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Target className="h-4 w-4 mr-2" />
                  Generate Suggestions
                </>
              )}
            </Button>

            {suggestions.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Latest Suggestions</span>
                  {lastSuggestionTime && (
                    <span className="text-xs text-muted-foreground">
                      {lastSuggestionTime.toLocaleTimeString()}
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  {suggestions.map((suggestion, index) => (
                    <div 
                      key={index}
                      className="p-3 rounded-lg bg-muted/50 border-l-2 border-primary/30"
                    >
                      <p className="text-sm">{suggestion}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {suggestions.length === 0 && !isProcessing && (
              <div className="text-center p-6 text-muted-foreground">
                <Lightbulb className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Click "Generate Suggestions" to get AI-powered writing tips</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              AI-powered text processing tools
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={!state.selectedText || processingAction !== null}
                onClick={() => handleQuickAction('improve')}
              >
                {processingAction === 'improve' ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : null}
                Improve Text
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={!state.selectedText || processingAction !== null}
                onClick={() => handleQuickAction('fix-grammar')}
              >
                {processingAction === 'fix-grammar' ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : null}
                Fix Grammar
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={!state.selectedText || processingAction !== null}
                onClick={() => handleQuickAction('expand')}
              >
                {processingAction === 'expand' ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : null}
                Expand Ideas
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={!state.selectedText || processingAction !== null}
                onClick={() => handleQuickAction('shorten')}
              >
                {processingAction === 'shorten' ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : null}
                Simplify
              </Button>
            </div>
            {!state.selectedText && (
              <p className="text-xs text-muted-foreground mt-2">
                Select text in the editor to enable quick actions
              </p>
            )}
            {state.selectedText && (
              <p className="text-xs text-primary mt-2">
                Selected: "{state.selectedText.substring(0, 50)}{state.selectedText.length > 50 ? '...' : ''}"
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Story;
