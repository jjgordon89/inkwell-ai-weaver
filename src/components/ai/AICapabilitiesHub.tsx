
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  Wand2, 
  FileText, 
  Lightbulb, 
  BarChart3,
  Sparkles,
  RefreshCw,
  Clock
} from 'lucide-react';
import { useAI } from '@/hooks/useAI';
import { useWriting } from '@/contexts/WritingContext';
import { useToast } from "@/hooks/use-toast";

interface AICapability {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'writing' | 'analysis' | 'creative' | 'productivity';
  complexity: 'simple' | 'moderate' | 'complex';
  estimatedTime: string;
  enabled: boolean;
}

const capabilities: AICapability[] = [
  {
    id: 'smart-completion',
    name: 'Smart Text Completion',
    description: 'AI-powered text completion based on context',
    icon: <Wand2 className="h-4 w-4" />,
    category: 'writing',
    complexity: 'simple',
    estimatedTime: '1-2s',
    enabled: true
  },
  {
    id: 'style-analysis',
    name: 'Writing Style Analysis',
    description: 'Analyze tone, voice, and writing patterns',
    icon: <BarChart3 className="h-4 w-4" />,
    category: 'analysis',
    complexity: 'moderate',
    estimatedTime: '3-5s',
    enabled: true
  },
  {
    id: 'plot-generation',
    name: 'Plot Development Assistant',
    description: 'Generate plot ideas and story continuations',
    icon: <Lightbulb className="h-4 w-4" />,
    category: 'creative',
    complexity: 'complex',
    estimatedTime: '5-10s',
    enabled: true
  },
  {
    id: 'character-insights',
    name: 'Character Development',
    description: 'AI-driven character analysis and suggestions',
    icon: <Brain className="h-4 w-4" />,
    category: 'creative',
    complexity: 'moderate',
    estimatedTime: '3-7s',
    enabled: true
  },
  {
    id: 'document-summary',
    name: 'Document Summarization',
    description: 'Generate concise summaries of your writing',
    icon: <FileText className="h-4 w-4" />,
    category: 'productivity',
    complexity: 'moderate',
    estimatedTime: '2-4s',
    enabled: true
  },
  {
    id: 'creative-prompts',
    name: 'Creative Writing Prompts',
    description: 'Generate inspiring writing prompts and exercises',
    icon: <Sparkles className="h-4 w-4" />,
    category: 'creative',
    complexity: 'simple',
    estimatedTime: '1-3s',
    enabled: true
  }
];

const AICapabilitiesHub = () => {
  const { processText, isProcessing, isCurrentProviderConfigured } = useAI();
  const { state } = useWriting();
  const { toast } = useToast();
  const [activeOperations, setActiveOperations] = useState<Set<string>>(new Set());
  const [results, setResults] = useState<Record<string, string>>({});

  const runCapability = async (capability: AICapability) => {
    if (!isCurrentProviderConfigured()) {
      toast({
        title: "AI Not Configured",
        description: "Please configure your AI provider first.",
        variant: "destructive"
      });
      return;
    }

    if (!state.currentDocument?.content && ['style-analysis', 'plot-generation', 'document-summary'].includes(capability.id)) {
      toast({
        title: "No Content",
        description: "Please select a document with content to analyze.",
        variant: "destructive"
      });
      return;
    }

    setActiveOperations(prev => new Set(prev).add(capability.id));

    try {
      let prompt = '';
      const content = state.currentDocument?.content || '';

      switch (capability.id) {
        case 'smart-completion':
          prompt = `Continue this text naturally: ${content.slice(-200)}`;
          break;
        case 'style-analysis':
          prompt = `Analyze the writing style, tone, and voice of this text. Provide specific insights: ${content.slice(0, 1000)}`;
          break;
        case 'plot-generation':
          prompt = `Based on this story content, suggest 3 interesting plot developments: ${content.slice(0, 800)}`;
          break;
        case 'character-insights':
          prompt = `Analyze the characters in this text and provide development suggestions: ${content.slice(0, 1000)}`;
          break;
        case 'document-summary':
          prompt = `Provide a concise summary of this document: ${content}`;
          break;
        case 'creative-prompts':
          prompt = 'Generate 3 creative writing prompts for fiction writing, each with a unique theme.';
          break;
        default:
          prompt = `Help with: ${capability.description}`;
      }

      const result = await processText(prompt, 'improve');
      setResults(prev => ({ ...prev, [capability.id]: result }));
      
      toast({
        title: "AI Task Complete",
        description: `${capability.name} finished successfully.`,
      });
    } catch (error) {
      toast({
        title: "AI Task Failed",
        description: `Failed to run ${capability.name}. Please try again.`,
        variant: "destructive"
      });
    } finally {
      setActiveOperations(prev => {
        const next = new Set(prev);
        next.delete(capability.id);
        return next;
      });
    }
  };

  const getCategoryCapabilities = (category: string) => {
    return capabilities.filter(cap => cap.category === category);
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple': return 'bg-green-500';
      case 'moderate': return 'bg-yellow-500';
      case 'complex': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const CapabilityCard = ({ capability }: { capability: AICapability }) => {
    const isActive = activeOperations.has(capability.id);
    const hasResult = results[capability.id];

    return (
      <Card className="relative overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              {capability.icon}
              <div>
                <CardTitle className="text-sm">{capability.name}</CardTitle>
                <CardDescription className="text-xs mt-1">
                  {capability.description}
                </CardDescription>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className={`w-2 h-2 rounded-full ${getComplexityColor(capability.complexity)}`} />
              <span className="text-xs text-muted-foreground">{capability.estimatedTime}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            <Button
              onClick={() => runCapability(capability)}
              disabled={isActive || isProcessing || !capability.enabled}
              className="w-full"
              size="sm"
            >
              {isActive ? (
                <>
                  <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {capability.icon}
                  Run {capability.name}
                </>
              )}
            </Button>
            
            {isActive && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Running...</span>
                  <span>{capability.estimatedTime}</span>
                </div>
                <Progress value={undefined} className="h-1" />
              </div>
            )}
            
            {hasResult && (
              <div className="p-2 bg-muted/50 rounded text-xs">
                <div className="font-medium mb-1 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Result:
                </div>
                <p className="line-clamp-3">{results[capability.id]}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI Capabilities Hub
        </CardTitle>
        <CardDescription>
          Unified access to all AI-powered writing tools and features
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="writing" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="writing">Writing</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="creative">Creative</TabsTrigger>
            <TabsTrigger value="productivity">Productivity</TabsTrigger>
          </TabsList>

          <TabsContent value="writing" className="mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              {getCategoryCapabilities('writing').map(capability => (
                <CapabilityCard key={capability.id} capability={capability} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analysis" className="mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              {getCategoryCapabilities('analysis').map(capability => (
                <CapabilityCard key={capability.id} capability={capability} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="creative" className="mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              {getCategoryCapabilities('creative').map(capability => (
                <CapabilityCard key={capability.id} capability={capability} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="productivity" className="mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              {getCategoryCapabilities('productivity').map(capability => (
                <CapabilityCard key={capability.id} capability={capability} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AICapabilitiesHub;
