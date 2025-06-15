
import { Link, Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { useCrossReferences } from '@/hooks/useCrossReferences';
import DocumentReferences from './cross-references/DocumentReferences';
import StoryConnections from './cross-references/StoryConnections';
import QuickStats from './cross-references/QuickStats';

const CrossReferences = () => {
  const {
    state,
    searchTerm,
    setSearchTerm,
    findCharacterReferences,
    connections,
    filteredConnections
  } = useCrossReferences();

  return (
    <div className="h-full bg-muted/30 p-4 flex flex-col space-y-6 border-l">
      <div>
        <h3 className="text-lg font-semibold flex items-center mb-2">
          <Link className="h-5 w-5 mr-2 text-primary" />
          Cross-References
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Track connections between characters, story arcs, and world elements.
        </p>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search connections..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="flex-grow overflow-auto space-y-4">
        <DocumentReferences
          characters={state.characters}
          currentDocument={state.currentDocument}
          findCharacterReferences={findCharacterReferences}
        />

        <StoryConnections filteredConnections={filteredConnections} />

        <QuickStats
          characters={state.characters}
          storyArcs={state.storyArcs}
          worldElements={state.worldElements}
          connectionsCount={connections.length}
        />
      </div>
    </div>
  );
};

export default CrossReferences;
