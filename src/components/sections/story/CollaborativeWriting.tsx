
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  PenTool, 
  Wand2, 
  Play, 
  Pause, 
  RotateCcw, 
  Save,
  Loader2,
  MessageSquarePlus,
  ArrowRight
} from 'lucide-react';
import { useWriting } from '@/contexts/WritingContext';
import { useAI } from '@/hooks/useAI';
import { useToast } from "@/hooks/use-toast";

interface WritingSession {
  id: string;
  prompt: string;
  content: string;
  turns: WritingTurn[];
  isActive: boolean;
  createdAt: Date;
}

interface WritingTurn {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

const CollaborativeWriting = () => {
  const { state, dispatch } = useWriting();
  const { processText, isProcessing, isCurrentProviderConfigured } = useAI();
  const { toast } = useToast();

  const [currentSession, setCurrentSession] = useState<WritingSession | null>(null);
  const [initialPrompt, setInitialPrompt] = useState('');
  const [userInput, setUserInput] = useState('');
  const [isSessionActive, setIsSessionActive] = useState(false);

  const startWritingSession = async () => {
    if (!initialPrompt.trim()) {
      toast({
        title: "Prompt Required",
        description: "Please enter a writing prompt to begin",
        variant: "destructive"
      });
      return;
    }

    if (!isCurrentProviderConfigured()) {
      toast({
        title: "AI Not Configured",
        description: "Please configure your AI provider in the AI Assistance settings",
        variant: "destructive"
      });
      return;
    }

    try {
      // Generate initial content from prompt
      const initialContent = await processText(
        `Begin a creative story based on this prompt: "${initialPrompt}". Write the opening 2-3 paragraphs that establish the scene, character, and mood. Leave it at a natural place where the story can continue.`,
        'generate-plot'
      );

      const newSession: WritingSession = {
        id: Date.now().toString(),
        prompt: initialPrompt,
        content: initialContent,
        turns: [
          {
            id: '1',
            type: 'ai',
            content: initialContent,
            timestamp: new Date()
          }
        ],
        isActive: true,
        createdAt: new Date()
      };

      setCurrentSession(newSession);
      setIsSessionActive(true);
      setInitialPrompt('');

      toast({
        title: "Writing Session Started",
        description: "AI has created the opening. Add your input to continue!",
      });
    } catch (error) {
      console.error('Failed to start writing session:', error);
      toast({
        title: "Error",
        description: "Failed to start writing session. Please try again.",
        variant: "destructive"
      });
    }
  };

  const continueWriting = async () => {
    if (!currentSession || !userInput.trim()) return;

    const userTurn: WritingTurn = {
      id: Date.now().toString(),
      type: 'user',
      content: userInput,
      timestamp: new Date()
    };

    // Add user input to session
    const updatedSession = {
      ...currentSession,
      content: currentSession.content + '\n\n' + userInput,
      turns: [...currentSession.turns, userTurn]
    };

    setCurrentSession(updatedSession);
    setUserInput('');

    try {
      // Generate AI continuation
      const continuation = await processText(
        `Continue this collaborative story naturally. Here's what has been written so far:\n\n${updatedSession.content}\n\nWrite the next 2-3 paragraphs that follow logically from the last addition, maintaining the established tone and style.`,
        'continue-story'
      );

      const aiTurn: WritingTurn = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: continuation,
        timestamp: new Date()
      };

      const finalSession = {
        ...updatedSession,
        content: updatedSession.content + '\n\n' + continuation,
        turns: [...updatedSession.turns, aiTurn]
      };

      setCurrentSession(finalSession);

      toast({
        title: "Story Continued",
        description: "AI has added the next section. Your turn!",
      });
    } catch (error) {
      console.error('Failed to continue writing:', error);
      toast({
        title: "Error",
        description: "Failed to continue the story. Please try again.",
        variant: "destructive"
      });
    }
  };

  const pauseSession = () => {
    setIsSessionActive(false);
    toast({
      title: "Session Paused",
      description: "You can resume writing anytime",
    });
  };

  const resumeSession = () => {
    setIsSessionActive(true);
    toast({
      title: "Session Resumed",
      description: "Continue your collaborative writing",
    });
  };

  const resetSession = () => {
    setCurrentSession(null);
    setIsSessionActive(false);
    setUserInput('');
    setInitialPrompt('');
    toast({
      title: "Session Reset",
      description: "Ready to start a new writing session",
    });
  };

  const saveToDocument = () => {
    if (!currentSession || !state.currentDocument) return;

    const newContent = state.currentDocument.content + '\n\n' + currentSession.content;
    
    dispatch({
      type: 'UPDATE_DOCUMENT_CONTENT',
      payload: {
        id: state.currentDocument.id,
        content: newContent
      }
    });

    toast({
      title: "Saved to Document",
      description: "Collaborative writing session added to your current document",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PenTool className="h-5 w-5 text-primary" />
          Collaborative Writing
        </CardTitle>
        <CardDescription>
          Start writing from a prompt and continue collaboratively with AI
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!currentSession ? (
          // Start new session
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Writing Prompt</label>
              <Textarea
                value={initialPrompt}
                onChange={(e) => setInitialPrompt(e.target.value)}
                placeholder="Enter a writing prompt to begin your story... (e.g., 'A detective finds a mysterious letter in an abandoned house')"
                className="min-h-20"
              />
            </div>
            
            <Button 
              onClick={startWritingSession}
              disabled={isProcessing || !initialPrompt.trim() || !isCurrentProviderConfigured()}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Starting Session...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start Writing Session
                </>
              )}
            </Button>

            {!isCurrentProviderConfigured() && (
              <Alert>
                <Wand2 className="h-4 w-4" />
                <AlertDescription>
                  Configure your AI provider in the AI Assistance settings to use collaborative writing.
                </AlertDescription>
              </Alert>
            )}
          </div>
        ) : (
          // Active session
          <div className="space-y-4">
            {/* Session Header */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant={isSessionActive ? "default" : "secondary"}>
                    {isSessionActive ? "Active" : "Paused"}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {currentSession.turns.length} turns
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Prompt: "{currentSession.prompt}"
                </p>
              </div>
              
              <div className="flex gap-2">
                {isSessionActive ? (
                  <Button variant="outline" size="sm" onClick={pauseSession}>
                    <Pause className="h-3 w-3 mr-1" />
                    Pause
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" onClick={resumeSession}>
                    <Play className="h-3 w-3 mr-1" />
                    Resume
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={resetSession}>
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Reset
                </Button>
                {state.currentDocument && (
                  <Button variant="outline" size="sm" onClick={saveToDocument}>
                    <Save className="h-3 w-3 mr-1" />
                    Save
                  </Button>
                )}
              </div>
            </div>

            {/* Story Content */}
            <div className="space-y-3 max-h-96 overflow-y-auto bg-muted/30 p-4 rounded-lg">
              {currentSession.turns.map((turn, index) => (
                <div 
                  key={turn.id}
                  className={`p-3 rounded-lg ${
                    turn.type === 'ai' 
                      ? 'bg-blue-50 dark:bg-blue-950/30 border-l-2 border-blue-500' 
                      : 'bg-green-50 dark:bg-green-950/30 border-l-2 border-green-500'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={turn.type === 'ai' ? "default" : "secondary"} className="text-xs">
                      {turn.type === 'ai' ? 'AI' : 'You'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {turn.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed">{turn.content}</p>
                </div>
              ))}
            </div>

            {/* User Input */}
            {isSessionActive && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Your Addition</label>
                  <Textarea
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Add your part of the story... The AI will continue from here."
                    className="min-h-20"
                  />
                </div>
                
                <Button 
                  onClick={continueWriting}
                  disabled={isProcessing || !userInput.trim()}
                  className="w-full"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      AI is writing...
                    </>
                  ) : (
                    <>
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Continue Story with AI
                    </>
                  )}
                </Button>
              </div>
            )}

            {!isSessionActive && (
              <Alert>
                <MessageSquarePlus className="h-4 w-4" />
                <AlertDescription>
                  Session is paused. Resume to continue collaborative writing.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CollaborativeWriting;
