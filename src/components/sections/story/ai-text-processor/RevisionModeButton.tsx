
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RotateCcw, Brain } from 'lucide-react';
import AIRevisionMode from '@/components/ai/AIRevisionMode';
import { useWriting } from '@/contexts/WritingContext';

interface RevisionModeButtonProps {
  isProviderConfigured: boolean;
}

const RevisionModeButton: React.FC<RevisionModeButtonProps> = ({
  isProviderConfigured
}) => {
  const [isRevisionModeActive, setIsRevisionModeActive] = useState(false);
  const { state, dispatch } = useWriting();

  const handleApplyRevisions = (revisions: any[]) => {
    if (!state.currentDocument || revisions.length === 0) return;

    let newContent = state.currentDocument.content || '';
    
    // Apply revisions in reverse order to maintain correct positions
    const sortedRevisions = [...revisions].sort((a, b) => b.position.start - a.position.start);
    
    for (const revision of sortedRevisions) {
      if (revision.status === 'accepted') {
        newContent = newContent.slice(0, revision.position.start) + 
                    revision.revisedText + 
                    newContent.slice(revision.position.end);
      }
    }

    dispatch({
      type: 'UPDATE_DOCUMENT_CONTENT',
      payload: {
        id: state.currentDocument.id,
        content: newContent
      }
    });

    setIsRevisionModeActive(false);
  };

  if (!isProviderConfigured) {
    return (
      <Button variant="outline" disabled size="sm">
        <Brain className="h-4 w-4 mr-2" />
        Revision Mode (Configure AI first)
      </Button>
    );
  }

  return (
    <div className="space-y-4">
      <Button
        variant={isRevisionModeActive ? "default" : "outline"}
        size="sm"
        onClick={() => setIsRevisionModeActive(!isRevisionModeActive)}
      >
        {isRevisionModeActive ? (
          <>
            <RotateCcw className="h-4 w-4 mr-2" />
            Exit Revision Mode
          </>
        ) : (
          <>
            <Brain className="h-4 w-4 mr-2" />
            Start Revision Mode
          </>
        )}
      </Button>

      {isRevisionModeActive && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">AI Revision Mode</CardTitle>
          </CardHeader>
          <CardContent>
            <AIRevisionMode
              documentContent={state.currentDocument?.content || ''}
              isActive={isRevisionModeActive}
              onToggle={() => setIsRevisionModeActive(!isRevisionModeActive)}
              onApplyRevisions={handleApplyRevisions}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RevisionModeButton;
