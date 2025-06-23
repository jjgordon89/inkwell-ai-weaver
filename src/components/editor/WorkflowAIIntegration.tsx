
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Workflow, ChevronDown, ChevronUp } from 'lucide-react';
import { useWriting } from '@/contexts/WritingContext';
import OneClickActions from '@/components/ai/OneClickActions';
import BatchProcessor from '@/components/ai/BatchProcessor';
import ContextAwareAIPanel from '@/components/ai/ContextAwareAIPanel';
import AIPoweredTemplates from '@/components/ai/AIPoweredTemplates';

interface WorkflowAIIntegrationProps {
  selectedText?: string;
  suggestions?: string[];
  isVisible?: boolean;
}

const WorkflowAIIntegration: React.FC<WorkflowAIIntegrationProps> = ({
  selectedText,
  suggestions = [],
  isVisible = true
}) => {
  const { state } = useWriting();
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'context' | 'actions' | 'batch' | 'templates'>('context');

  if (!isVisible) return null;

  const hasActiveDocument = !!state.currentDocument;
  const hasSelectedText = !!selectedText;
  const hasSuggestions = suggestions.length > 0;

  return (
    <div className="fixed bottom-4 left-4 z-40 max-w-sm">
      {!isExpanded ? (
        // Collapsed state - floating action button
        <Card className="p-3 shadow-lg bg-background/95 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Workflow className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">AI Workflow</span>
              {hasActiveDocument && (
                <Badge variant="secondary" className="text-xs">
                  Ready
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(true)}
              className="h-6 w-6 p-0"
            >
              <ChevronUp className="h-3 w-3" />
            </Button>
          </div>
          
          {/* Quick actions when collapsed */}
          {hasSelectedText && (
            <div className="mt-2 pt-2 border-t">
              <OneClickActions selectedText={selectedText} isCompact />
            </div>
          )}
        </Card>
      ) : (
        // Expanded state - full panel
        <Card className="w-80 max-h-96 shadow-xl bg-background/95 backdrop-blur-sm">
          <div className="p-3 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Workflow className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">AI Workflow</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
                className="h-6 w-6 p-0"
              >
                <ChevronDown className="h-3 w-3" />
              </Button>
            </div>
            
            {/* Tab navigation */}
            <div className="flex gap-1 mt-2">
              <Button
                variant={activeTab === 'context' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('context')}
                className="h-6 px-2 text-xs"
              >
                Context
              </Button>
              <Button
                variant={activeTab === 'actions' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('actions')}
                className="h-6 px-2 text-xs"
              >
                Actions
              </Button>
              <Button
                variant={activeTab === 'batch' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('batch')}
                className="h-6 px-2 text-xs"
                disabled={!hasSuggestions}
              >
                Batch
                {hasSuggestions && (
                  <Badge variant="secondary" className="ml-1 text-xs px-1">
                    {suggestions.length}
                  </Badge>
                )}
              </Button>
              <Button
                variant={activeTab === 'templates' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('templates')}
                className="h-6 px-2 text-xs"
              >
                Templates
              </Button>
            </div>
          </div>

          <div className="p-3 overflow-y-auto max-h-80">
            {activeTab === 'context' && <ContextAwareAIPanel />}
            
            {activeTab === 'actions' && (
              <OneClickActions selectedText={selectedText} />
            )}
            
            {activeTab === 'batch' && hasSuggestions && (
              <BatchProcessor suggestions={suggestions} />
            )}
            
            {activeTab === 'batch' && !hasSuggestions && (
              <div className="text-center py-6 text-muted-foreground">
                <p className="text-xs">No suggestions available for batch processing</p>
              </div>
            )}

            {activeTab === 'templates' && <AIPoweredTemplates />}
          </div>
        </Card>
      )}
    </div>
  );
};

export default WorkflowAIIntegration;
