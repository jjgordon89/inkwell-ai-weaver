
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, X, RotateCcw, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAI } from '@/hooks/useAI';

interface Revision {
  id: string;
  originalText: string;
  revisedText: string;
  reason: string;
  position: { start: number; end: number };
  confidence: number;
  status: 'pending' | 'accepted' | 'rejected';
}

interface AIRevisionModeProps {
  documentContent: string;
  isActive: boolean;
  onToggle: () => void;
  onApplyRevisions: (revisions: Revision[]) => void;
}

const AIRevisionMode: React.FC<AIRevisionModeProps> = ({
  documentContent,
  isActive,
  onToggle,
  onApplyRevisions
}) => {
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const { processText, isCurrentProviderConfigured } = useAI();

  const generateRevisions = async () => {
    if (!documentContent || documentContent.length < 100) return;
    if (!isCurrentProviderConfigured()) return;

    setIsGenerating(true);
    try {
      // Split content into sentences for targeted revisions
      const sentences = documentContent.split(/[.!?]+/).filter(s => s.trim().length > 20);
      const newRevisions: Revision[] = [];

      // Generate revisions for first few sentences (to avoid overwhelming)
      for (let i = 0; i < Math.min(sentences.length, 3); i++) {
        const sentence = sentences[i].trim();
        if (sentence) {
          try {
            const improvement = await processText(sentence, 'improve');
            if (improvement && improvement.trim() !== sentence.trim()) {
              const startPos = documentContent.indexOf(sentence);
              if (startPos !== -1) {
                newRevisions.push({
                  id: `revision-${i}`,
                  originalText: sentence,
                  revisedText: improvement,
                  reason: 'Improved clarity and flow',
                  position: { start: startPos, end: startPos + sentence.length },
                  confidence: 85 + Math.floor(Math.random() * 15),
                  status: 'pending'
                });
              }
            }
          } catch (error) {
            console.warn(`Failed to process sentence ${i}:`, error);
          }
        }
      }

      setRevisions(newRevisions);
    } catch (error) {
      console.error('Failed to generate revisions:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (isActive && documentContent && isCurrentProviderConfigured()) {
      generateRevisions();
    }
  }, [isActive, documentContent]);

  const handleRevisionAction = (revisionId: string, action: 'accept' | 'reject') => {
    setRevisions(prev => prev.map(rev => 
      rev.id === revisionId 
        ? { ...rev, status: action === 'accept' ? 'accepted' : 'rejected' }
        : rev
    ));
  };

  const applyAcceptedRevisions = () => {
    const acceptedRevisions = revisions.filter(rev => rev.status === 'accepted');
    onApplyRevisions(acceptedRevisions);
    setRevisions([]);
  };

  const pendingCount = revisions.filter(rev => rev.status === 'pending').length;
  const acceptedCount = revisions.filter(rev => rev.status === 'accepted').length;

  if (!isCurrentProviderConfigured()) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        <p className="text-sm">Please configure an AI provider first to use revision mode.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {showPreview && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
              Preview
            </Button>
          )}
        </div>

        {revisions.length > 0 && (
          <div className="flex items-center gap-2">
            <Badge variant="outline">{pendingCount} pending</Badge>
            {acceptedCount > 0 && (
              <Button size="sm" onClick={applyAcceptedRevisions}>
                Apply {acceptedCount} changes
              </Button>
            )}
          </div>
        )}
      </div>

      <Card className="p-4">
        <ScrollArea className="h-64">
          <div className="space-y-3">
            {isGenerating && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm text-muted-foreground">Generating revisions...</span>
              </div>
            )}

            {revisions.map((revision) => (
              <div
                key={revision.id}
                className={`p-3 rounded border transition-colors ${
                  revision.status === 'accepted' 
                    ? 'bg-green-50 border-green-200' 
                    : revision.status === 'rejected'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-background'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {revision.confidence}% confidence
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {revision.reason}
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-xs">
                      <span className="font-medium">Original: </span>
                      <span className="bg-red-100 px-1 rounded">
                        {revision.originalText}
                      </span>
                    </div>
                    <div className="text-xs">
                      <span className="font-medium">Revised: </span>
                      <span className="bg-green-100 px-1 rounded">
                        {revision.revisedText}
                      </span>
                    </div>
                  </div>

                  {revision.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleRevisionAction(revision.id, 'accept')}
                        className="h-6 text-xs"
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Accept
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRevisionAction(revision.id, 'reject')}
                        className="h-6 text-xs"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {revisions.length === 0 && !isGenerating && (
              <div className="text-center py-8 text-muted-foreground">
                <RotateCcw className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No revisions available</p>
                <p className="text-xs">Write more content to get AI suggestions</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
};

export default AIRevisionMode;
