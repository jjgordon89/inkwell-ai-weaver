
import { User } from 'lucide-react';
import { useWriting } from '@/contexts/WritingContext';
import Characters from './sections/Characters';
import StoryArcs from './sections/StoryArcs';
import WorldBuilding from './sections/WorldBuilding';
import CrossReferences from './sections/CrossReferences';
import AIAssistance from './sections/AIAssistance';
import Story from './sections/Story';
import Outline from './sections/Outline';
import StoryStructure from './sections/StoryStructure';
import ExportPublishing from './sections/ExportPublishing';
import StoryTabs from './sections/story/StoryTabs';

const RightPanel = () => {
  const { state } = useWriting();

  if (state.activeSection === 'outline') {
    return <Outline />;
  }

  if (state.activeSection === 'story-structure') {
    return <StoryStructure />;
  }

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

  // Show story-specific features when in story section
  if (state.activeSection === 'story') {
    return (
      <div className="h-full bg-muted/30 p-4 flex flex-col border-l overflow-y-auto">
        <StoryTabs />
      </div>
    );
  }

  const selectedCharacter = state.characters.find(char => 
    state.selectedText && state.selectedText.toLowerCase().includes(char.name.toLowerCase())
  );

  return (
    <div className="h-full bg-muted/30 p-4 flex flex-col border-l">
      <div className="flex-grow">
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
