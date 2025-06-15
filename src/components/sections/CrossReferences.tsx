
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link, Users, GitMerge, Globe, Search, Plus } from 'lucide-react';
import { useWriting } from '@/contexts/WritingContext';
import { Input } from "@/components/ui/input";

const CrossReferences = () => {
  const { state } = useWriting();
  const [searchTerm, setSearchTerm] = useState('');

  // Helper function to find references to a character in the current document
  const findCharacterReferences = (characterName: string) => {
    if (!state.currentDocument) return [];
    const content = state.currentDocument.content.toLowerCase();
    const name = characterName.toLowerCase();
    const regex = new RegExp(`\\b${name}\\b`, 'g');
    const matches = content.match(regex);
    return matches ? matches.length : 0;
  };

  // Helper function to find connections between story elements
  const findConnections = () => {
    const connections = [];

    // Characters mentioned in story arcs
    state.storyArcs.forEach(arc => {
      state.characters.forEach(character => {
        if (arc.description.toLowerCase().includes(character.name.toLowerCase())) {
          connections.push({
            type: 'character-arc',
            from: character,
            to: arc,
            relationship: 'appears in'
          });
        }
      });
    });

    // Characters connected to world elements
    state.worldElements.forEach(element => {
      state.characters.forEach(character => {
        if (element.description.toLowerCase().includes(character.name.toLowerCase()) ||
            character.description.toLowerCase().includes(element.name.toLowerCase())) {
          connections.push({
            type: 'character-world',
            from: character,
            to: element,
            relationship: 'connected to'
          });
        }
      });
    });

    // Story arcs connected to world elements
    state.storyArcs.forEach(arc => {
      state.worldElements.forEach(element => {
        if (arc.description.toLowerCase().includes(element.name.toLowerCase())) {
          connections.push({
            type: 'arc-world',
            from: arc,
            to: element,
            relationship: 'takes place in'
          });
        }
      });
    });

    return connections;
  };

  const connections = findConnections();
  const filteredConnections = connections.filter(conn => 
    searchTerm === '' ||
    conn.from.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (conn.to.name || conn.to.title).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getIcon = (type: string) => {
    switch (type) {
      case 'character-arc':
        return <GitMerge className="h-4 w-4" />;
      case 'character-world':
        return <Globe className="h-4 w-4" />;
      case 'arc-world':
        return <Link className="h-4 w-4" />;
      default:
        return <Link className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'character-arc':
        return 'bg-blue-100 text-blue-800';
      case 'character-world':
        return 'bg-green-100 text-green-800';
      case 'arc-world':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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
        {/* Character References in Current Document */}
        {state.currentDocument && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-sm">
                <Users className="h-4 w-4 mr-2" />
                Document References
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {state.characters.map(character => {
                const refCount = findCharacterReferences(character.name);
                return refCount > 0 ? (
                  <div key={character.id} className="flex items-center justify-between text-sm">
                    <span>{character.name}</span>
                    <Badge variant="secondary">{refCount} mention{refCount !== 1 ? 's' : ''}</Badge>
                  </div>
                ) : null;
              })}
              {state.characters.every(char => findCharacterReferences(char.name) === 0) && (
                <p className="text-sm text-muted-foreground">No character references found in current document.</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Story Element Connections */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-sm">
              <Link className="h-4 w-4 mr-2" />
              Story Connections
            </CardTitle>
            <CardDescription>
              Relationships between characters, story arcs, and world elements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {filteredConnections.length > 0 ? (
              filteredConnections.map((connection, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-background rounded-lg border">
                  <div className={`p-2 rounded-md ${getTypeColor(connection.type)}`}>
                    {getIcon(connection.type)}
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm truncate">
                        {connection.from.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {connection.relationship}
                      </span>
                      <span className="font-medium text-sm truncate">
                        {connection.to.name || connection.to.title}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {connection.type.replace('-', ' → ')}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Link className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-2">No connections found</p>
                <p className="text-xs text-muted-foreground">
                  Connections are automatically detected when story elements reference each other.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-sm">
              <Plus className="h-4 w-4 mr-2" />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Characters:</span>
              <Badge variant="secondary">{state.characters.length}</Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span>Story Arcs:</span>
              <Badge variant="secondary">{state.storyArcs.length}</Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span>World Elements:</span>
              <Badge variant="secondary">{state.worldElements.length}</Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span>Total Connections:</span>
              <Badge variant="secondary">{connections.length}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CrossReferences;
