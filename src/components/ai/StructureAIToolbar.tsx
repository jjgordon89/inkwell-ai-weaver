import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Loader2, BookOpen, GraduationCap, BookText, FileText } from 'lucide-react';
import { useStructureAI } from '@/hooks/ai/useStructureAI';
import { useAI } from '@/hooks/useAI';

interface StructureAIToolbarProps {
  structureType: 'novel' | 'screenplay' | 'research' | 'poetry' | 'academic' | 'memoir' | 'nonfiction';
  selectedText: string;
  onApplyAIResult: (result: string) => void;
}

export function StructureAIToolbar({ 
  structureType, 
  selectedText, 
  onApplyAIResult 
}: StructureAIToolbarProps) {
  const { getActionsForStructure, processStructureSpecificText, isProcessing } = useStructureAI();
  const { isCurrentProviderConfigured } = useAI();
  const { toast } = useToast();
  const [availableActions, setAvailableActions] = useState<ReturnType<typeof getActionsForStructure>>([]);
  
  useEffect(() => {
    setAvailableActions(getActionsForStructure(structureType));
  }, [structureType, getActionsForStructure]);

  const handleActionClick = async (actionId: string, actionName: string) => {
    if (!selectedText.trim()) {
      toast({
        title: "No text selected",
        description: "Please select some text to process with AI.",
        variant: "destructive"
      });
      return;
    }

    if (!isCurrentProviderConfigured()) {
      toast({
        title: "AI provider not configured",
        description: "Please configure your AI provider in the settings.",
        variant: "destructive"
      });
      return;
    }

    try {
      toast({
        title: `Processing with ${actionName}`,
        description: "AI is working on your text...",
      });
      
      const result = await processStructureSpecificText(selectedText, actionId);
      
      toast({
        title: "AI processing complete",
        description: `${actionName} action completed successfully.`
      });
      
      onApplyAIResult(result);
    } catch (error) {
      toast({
        title: "AI processing failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };

  // Get structure-specific icon
  const getStructureIcon = () => {
    switch (structureType) {
      case 'academic':
        return <GraduationCap className="w-4 h-4 mr-2" />;
      case 'memoir':
        return <BookOpen className="w-4 h-4 mr-2" />;
      case 'nonfiction':
        return <BookText className="w-4 h-4 mr-2" />;
      case 'novel':
        return <BookOpen className="w-4 h-4 mr-2" />;
      case 'screenplay':
        return <FileText className="w-4 h-4 mr-2" />;
      case 'poetry':
        return <Sparkles className="w-4 h-4 mr-2" />;
      case 'research':
        return <GraduationCap className="w-4 h-4 mr-2" />;
      default:
        return <Sparkles className="w-4 h-4 mr-2" />;
    }
  };

  // Group actions by type
  const groupedActions = availableActions.reduce((acc, action) => {
    // Create group based on action id prefix (before first dash)
    const group = action.id.split('-')[0];
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(action);
    return acc;
  }, {} as Record<string, typeof availableActions>);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2" disabled={isProcessing}>
          {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : getStructureIcon()}
          AI Assistant
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>AI Actions for {structureType}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {Object.entries(groupedActions).map(([group, actions]) => (
          <React.Fragment key={group}>
            <DropdownMenuGroup>
              {actions.map((action) => (
                <DropdownMenuItem
                  key={action.id}
                  onClick={() => handleActionClick(action.id, action.name)}
                  disabled={isProcessing}
                >
                  <span className="flex flex-col">
                    <span>{action.name}</span>
                    <span className="text-xs text-muted-foreground">{action.description}</span>
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
