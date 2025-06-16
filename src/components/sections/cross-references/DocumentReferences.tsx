
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from 'lucide-react';
import { Character } from '@/contexts/WritingContext';

interface DocumentReferencesProps {
  characters: Character[];
  currentDocument: { id: string; title: string; content: string } | null;
  findCharacterReferences: (characterName: string) => number;
}

const DocumentReferences = ({ characters, currentDocument, findCharacterReferences }: DocumentReferencesProps) => {
  if (!currentDocument) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-sm">
          <Users className="h-4 w-4 mr-2" />
          Document References
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {characters.map(character => {
          const refCount = findCharacterReferences(character.name);
          return refCount > 0 ? (
            <div key={character.id} className="flex items-center justify-between text-sm">
              <span>{character.name}</span>
              <Badge variant="secondary">{refCount} mention{refCount !== 1 ? 's' : ''}</Badge>
            </div>
          ) : null;
        })}
        {characters.every(char => findCharacterReferences(char.name) === 0) && (
          <p className="text-sm text-muted-foreground">No character references found in current document.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentReferences;
