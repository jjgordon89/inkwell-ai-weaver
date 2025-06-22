
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Lightbulb, 
  BookOpen, 
  Loader2, 
  Plus, 
  ArrowRight 
} from 'lucide-react';
import { PlotElement } from '@/hooks/ai/types';

interface PlotDevelopmentTabProps {
  plotElements: PlotElement[];
  storyContinuation: string;
  onGeneratePlotElements: () => void;
  onGenerateStoryContinuation: () => void;
  onApplySuggestion: (suggestion: string) => void;
  onApplyContinuation: () => void;
  isProcessing: boolean;
  hasDocument: boolean;
}

const PlotDevelopmentTab: React.FC<PlotDevelopmentTabProps> = ({
  plotElements,
  storyContinuation,
  onGeneratePlotElements,
  onGenerateStoryContinuation,
  onApplySuggestion,
  onApplyContinuation,
  isProcessing,
  hasDocument
}) => {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <Button 
          onClick={onGeneratePlotElements}
          disabled={isProcessing || !hasDocument}
          variant="outline"
        >
          {isProcessing ? (
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          ) : (
            <Lightbulb className="h-3 w-3 mr-1" />
          )}
          Plot Elements
        </Button>
        <Button 
          onClick={onGenerateStoryContinuation}
          disabled={isProcessing || !hasDocument}
          variant="outline"
        >
          {isProcessing ? (
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          ) : (
            <BookOpen className="h-3 w-3 mr-1" />
          )}
          Continue Story
        </Button>
      </div>
      
      {plotElements.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Plot Suggestions</h4>
          {plotElements.map((element, index) => (
            <div 
              key={index}
              className="p-3 rounded-lg bg-muted/50 border-l-2 border-green-500/30 group hover:bg-muted/70 transition-colors"
            >
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs">{element.type}</Badge>
                <Badge variant="secondary" className="text-xs">{element.placement}</Badge>
              </div>
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm flex-1">{element.description}</p>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onApplySuggestion(element.description)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {storyContinuation && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Story Continuation</h4>
          <div className="p-3 rounded-lg bg-muted/50 border-l-2 border-purple-500/30">
            <div className="flex items-start justify-between gap-2 mb-2">
              <p className="text-sm flex-1">{storyContinuation}</p>
            </div>
            <Button
              size="sm"
              onClick={onApplyContinuation}
              className="w-full"
            >
              <ArrowRight className="h-3 w-3 mr-1" />
              Add to Document
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlotDevelopmentTab;
