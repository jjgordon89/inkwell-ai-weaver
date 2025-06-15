import { Lightbulb, User } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useWriting } from '@/contexts/WritingContext';
import { useAI } from '@/hooks/useAI';
import { useState } from 'react';
import Characters from './sections/Characters';
import StoryArcs from './sections/StoryArcs';
import WorldBuilding from './sections/WorldBuilding';
import CrossReferences from './sections/CrossReferences';
import AIAssistance from './sections/AIAssistance';

const RightPanel = () => {
  const { state, dispatch } = useWriting();
  const { processText, isProcessing } = useAI();
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Show specific components based on active section
  if (state.activeSection === 'characters') {
    return <Characters />;
  }

  if (state.activeSection === 'story-arc') {
    return <StoryArcs />;
  }

  if (state.activeSection === 'world-building') {
    return <WorldBuilding />;
  }

  if (state.activeSection === 'cross-references') {
    return <CrossReferences />;
  }

  if (state.activeSection === 'ai-assistance') {
    return <AIAssistance />;
  }

  const handleTextImprovement = async (action: 'improve' | 'shorten' | 'expand' | 'fix-grammar') => {
    if (!state.selectedText || !state.currentDocument) return;

    try {
      const improvedText = await processText(state.selectedText, action);
      
      // Replace selected text in the document
      const newContent = state.currentDocument.content.replace(
        state.selectedText,
        improvedText
      );
      
      dispatch({
        type: 'UPDATE_DOCUMENT_CONTENT',
        payload: {
          id: state.currentDocument.id,
          content: newContent
        }
      });
      
      // Clear selection
      dispatch({ type: 'SET_SELECTED_TEXT', payload: '' });
    } catch (error) {
      console.error('AI processing failed:', error);
    }
  };

  const selectedCharacter = state.characters.find(char => 
    state.selectedText && state.selectedText.toLowerCase().includes(char.name.toLowerCase())
  );

  return (
    <div className="h-full bg-muted/30 p-4 flex flex-col space-y-6 border-l">
      <div>
        <h3 className="text-lg font-semibold flex items-center mb-2">
          <Lightbulb className="h-5 w-5 mr-2 text-primary" />
          AI Suggestions
        </h3>
        {state.selectedText ? (
          <div>
            <p className="text-sm text-muted-foreground mb-3">
              Selected: "{state.selectedText.substring(0, 50)}..."
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleTextImprovement('improve')}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Improve'}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleTextImprovement('shorten')}
                disabled={isProcessing}
              >
                Shorten
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleTextImprovement('expand')}
                disabled={isProcessing}
              >
                Expand
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleTextImprovement('fix-grammar')}
                disabled={isProcessing}
              >
                Fix Grammar
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-sm text-muted-foreground mb-3">
              Select text in the editor to get AI-powered suggestions for improving your writing.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" disabled>Improve</Button>
              <Button variant="outline" size="sm" disabled>Shorten</Button>
              <Button variant="outline" size="sm" disabled>Expand</Button>
              <Button variant="outline" size="sm" disabled>Fix Grammar</Button>
            </div>
          </div>
        )}
      </div>

      <div className="flex-grow border-t pt-6">
        <h3 className="text-lg font-semibold flex items-center mb-2">
          <User className="h-5 w-5 mr-2 text-primary" />
          Character Info
        </h3>
        <div className="text-sm text-muted-foreground space-y-4">
          {selectedCharacter ? (
            <div>
              <h4 className="font-medium text-foreground">{selectedCharacter.name}</h4>
              <p className="mt-1">{selectedCharacter.description}</p>
              {selectedCharacter.notes && (
                <div className="mt-2">
                  <span className="font-medium">Notes:</span>
                  <p className="mt-1">{selectedCharacter.notes}</p>
                </div>
              )}
            </div>
          ) : (
            <div>
              <p>No character selected.</p>
              <p>Click on a character's name in your text to see their details here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RightPanel;
