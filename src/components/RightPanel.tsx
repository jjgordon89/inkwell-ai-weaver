
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
import AITextProcessor from './sections/story/AITextProcessor';
import { cn } from '@/lib/utils';

const RightPanel = () => {
  const { state } = useWriting();

  // Show specific components based on active section
  if (state.activeSection === 'story') {
    return <Story />;
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
    <div className="h-full bg-gradient-to-b from-slate-50/50 to-white dark:from-slate-900/50 dark:to-slate-950 flex flex-col border-l border-slate-200 dark:border-slate-800">
      {/* AI Text Processing */}
      <div className="p-4 border-b border-slate-200/50 dark:border-slate-800/50">
        <AITextProcessor />
      </div>

      {/* Character Info Section */}
      <div className="flex-grow p-4">
        <div className="bg-white/60 dark:bg-slate-900/60 rounded-xl border border-slate-200/50 dark:border-slate-800/50 p-4 h-full backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            <h3 className="text-lg font-semibold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
              Character Info
            </h3>
          </div>
          
          <div className="text-sm space-y-4">
            {selectedCharacter ? (
              <div className="animate-slide-in">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-800/50 dark:to-slate-700/50 rounded-lg p-4 border border-blue-200/30 dark:border-slate-700/50">
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    {selectedCharacter.name}
                  </h4>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {selectedCharacter.description}
                  </p>
                  {selectedCharacter.notes && (
                    <div className="mt-3 pt-3 border-t border-slate-200/50 dark:border-slate-700/50">
                      <span className="font-medium text-slate-800 dark:text-slate-200">Notes:</span>
                      <p className="mt-1 text-slate-600 dark:text-slate-400 leading-relaxed">
                        {selectedCharacter.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                </div>
                <p className="text-slate-600 dark:text-slate-400 mb-2">No character selected</p>
                <p className="text-sm text-slate-500 dark:text-slate-500">
                  Click on a character's name in your text to see their details here
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RightPanel;
