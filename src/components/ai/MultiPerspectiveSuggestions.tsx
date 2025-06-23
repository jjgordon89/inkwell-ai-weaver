
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User, BookOpen, Sparkles, Refresh } from 'lucide-react';
import { useCollaborativeAI } from '@/hooks/useCollaborativeAI';

interface AIPerspective {
  id: string;
  name: string;
  role: string;
  icon: React.ReactNode;
  color: string;
  suggestions: string[];
}

interface MultiPerspectiveSuggestionsProps {
  selectedText: string;
  documentContent: string;
  onApplySuggestion: (suggestion: string) => void;
}

const MultiPerspectiveSuggestions: React.FC<MultiPerspectiveSuggestionsProps> = ({
  selectedText,
  documentContent,
  onApplySuggestion
}) => {
  const [perspectives, setPerspectives] = useState<AIPerspective[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activePerspective, setActivePerspective] = useState('editor');
  const { improveSelectedText } = useCollaborativeAI();

  const perspectiveConfigs = [
    {
      id: 'editor',
      name: 'Editor',
      role: 'Professional Editor',
      icon: <User className="h-4 w-4" />,
      color: 'bg-blue-100 text-blue-800',
      prompt: 'As a professional editor, analyze this text for grammar, style, clarity, and flow. Provide specific improvement suggestions.'
    },
    {
      id: 'reader',
      name: 'Reader',
      role: 'Average Reader',
      icon: <BookOpen className="h-4 w-4" />,
      color: 'bg-green-100 text-green-800',
      prompt: 'As an average reader, evaluate this text for engagement, understanding, and emotional impact. What would make it more compelling?'
    },
    {
      id: 'genre',
      name: 'Genre Expert',
      role: 'Genre Specialist',
      icon: <Sparkles className="h-4 w-4" />,
      color: 'bg-purple-100 text-purple-800',
      prompt: 'As a genre expert, analyze this text for genre conventions, tropes, and expectations. Suggest improvements that enhance genre appeal.'
    }
  ];

  const generatePerspectiveSuggestions = async () => {
    if (!selectedText && !documentContent) return;

    setIsGenerating(true);
    const newPerspectives: AIPerspective[] = [];

    try {
      for (const config of perspectiveConfigs) {
        const textToAnalyze = selectedText || documentContent.slice(0, 500);
        const prompt = `${config.prompt}\n\nText to analyze: "${textToAnalyze}"\n\nProvide 3-4 specific suggestions, each on a new line starting with "•"`;
        
        // For now, we'll generate mock suggestions. In a real implementation, you'd call the AI
        const mockSuggestions = await generateMockSuggestions(config.id, textToAnalyze);
        
        newPerspectives.push({
          ...config,
          suggestions: mockSuggestions
        });
      }

      setPerspectives(newPerspectives);
    } catch (error) {
      console.error('Failed to generate perspective suggestions:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateMockSuggestions = async (perspectiveId: string, text: string): Promise<string[]> => {
    // Mock implementation - replace with actual AI calls
    const suggestions = {
      editor: [
        'Consider breaking this long sentence into two for better readability',
        'The passive voice here could be strengthened with active voice',
        'This paragraph would benefit from a stronger transition',
        'Watch for repetitive word usage - "very" appears multiple times'
      ],
      reader: [
        'This section feels rushed - readers might need more context',
        'The emotional stakes could be clearer for better engagement',
        'Consider adding sensory details to help readers visualize the scene',
        'This dialogue feels natural and authentic - great work!'
      ],
      genre: [
        'This follows classic mystery conventions well',
        'Consider subverting reader expectations here for more impact',
        'The pacing aligns perfectly with thriller genre expectations',
        'This character archetype could be developed further'
      ]
    };

    return suggestions[perspectiveId as keyof typeof suggestions] || [];
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Multi-Perspective Analysis
          </CardTitle>
          <Button
            onClick={generatePerspectiveSuggestions}
            disabled={isGenerating || (!selectedText && !documentContent)}
            size="sm"
          >
            {isGenerating ? (
              <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <Refresh className="h-4 w-4 mr-2" />
            )}
            Analyze
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {perspectives.length === 0 && !isGenerating ? (
          <div className="text-center py-6 text-muted-foreground">
            <p className="text-sm">Select text or click Analyze to get multi-perspective suggestions</p>
          </div>
        ) : (
          <Tabs value={activePerspective} onValueChange={setActivePerspective}>
            <TabsList className="grid w-full grid-cols-3">
              {perspectiveConfigs.map((config) => (
                <TabsTrigger key={config.id} value={config.id} className="flex items-center gap-1">
                  {config.icon}
                  {config.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {perspectiveConfigs.map((config) => (
              <TabsContent key={config.id} value={config.id} className="mt-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge className={config.color} variant="outline">
                      {config.role}
                    </Badge>
                  </div>

                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {perspectives.find(p => p.id === config.id)?.suggestions.map((suggestion, index) => (
                        <Card key={index} className="p-3 hover:bg-muted/50 cursor-pointer transition-colors">
                          <div className="flex items-start justify-between">
                            <p className="text-sm flex-1">{suggestion}</p>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onApplySuggestion(suggestion)}
                              className="ml-2 h-6"
                            >
                              Apply
                            </Button>
                          </div>
                        </Card>
                      )) || (
                        isGenerating && (
                          <div className="flex items-center justify-center py-4">
                            <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
                            <span className="text-sm text-muted-foreground">Generating suggestions...</span>
                          </div>
                        )
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

export default MultiPerspectiveSuggestions;
