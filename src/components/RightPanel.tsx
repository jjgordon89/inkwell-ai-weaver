import { User } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import AITextProcessor from './sections/story/AITextProcessor';
import ChapterManagement from './sections/story/ChapterManagement';

const RightPanel = () => {
  const { state } = useWriting();

  // Show specific components based on active section
  if (state.activeSection === 'story') {
    return (
      <div className="h-full bg-muted/30 border-l">
        <Tabs defaultValue="chapters" className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-3 mx-4 mt-4">
            <TabsTrigger value="chapters">Chapters</TabsTrigger>
            <TabsTrigger value="ai-tools">AI Tools</TabsTrigger>
            <TabsTrigger value="character">Character</TabsTrigger>
          </TabsList>
          
          <TabsContent value="chapters" className="flex-1 overflow-auto">
            <ChapterManagement />
          </TabsContent>
          
          <TabsContent value="ai-tools" className="flex-1 overflow-auto p-4">
            <AITextProcessor />
          </TabsContent>
          
          <TabsContent value="character" className="flex-1 overflow-auto p-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <User className="h-5 w-5 mr-2 text-primary" />
                Character Info
              </h3>
              <div className="text-sm text-muted-foreground">
                {state.selectedText ? (
                  (() => {
                    const selectedCharacter = state.characters.find(char => 
                      state.selectedText && state.selectedText.toLowerCase().includes(char.name.toLowerCase())
                    );
                    
                    return selectedCharacter ? (
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
                        <p>No character found for selected text.</p>
                        <p>Click on a character's name in your text to see their details here.</p>
                      </div>
                    );
                  })()
                ) : (
                  <div>
                    <p>No character selected.</p>
                    <p>Click on a character's name in your text to see their details here.</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

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

  const selectedCharacter = state.characters.find(char => 
    state.selectedText && state.selectedText.toLowerCase().includes(char.name.toLowerCase())
  );

  return (
    <div className="h-full bg-muted/30 p-4 flex flex-col space-y-6 border-l">
      {/* AI Text Processing */}
      <AITextProcessor />

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
