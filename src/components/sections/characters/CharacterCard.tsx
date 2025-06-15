
import React from 'react';
import { Edit2, Trash2, Bot, Users } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Character } from '@/contexts/WritingContext';

interface CharacterCardProps {
  character: Character;
  onEdit: (character: Character) => void;
  onDelete: (characterId: string) => void;
  onViewRelationships?: (character: Character) => void;
}

const CharacterCard = ({ character, onEdit, onDelete, onViewRelationships }: CharacterCardProps) => {
  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">{character.name}</CardTitle>
            {character.createdWith === 'ai' && (
              <Bot className="h-4 w-4 text-blue-500" />
            )}
          </div>
          <div className="flex gap-1">
            {onViewRelationships && character.relationships.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewRelationships(character)}
                title={`${character.relationships.length} relationships`}
              >
                <Users className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(character)}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(character.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Character Details */}
        <div className="text-sm text-muted-foreground space-y-1">
          {character.age && <div>Age: {character.age}</div>}
          {character.occupation && <div>Occupation: {character.occupation}</div>}
        </div>
      </CardHeader>
      
      <CardContent>
        {character.appearance && (
          <div className="mb-3">
            <h4 className="text-sm font-medium mb-1">Appearance</h4>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {character.appearance}
            </p>
          </div>
        )}
        
        {character.personality && (
          <div className="mb-3">
            <h4 className="text-sm font-medium mb-1">Personality</h4>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {character.personality}
            </p>
          </div>
        )}
        
        {character.description && (
          <div className="mb-3">
            <h4 className="text-sm font-medium mb-1">Description</h4>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {character.description}
            </p>
          </div>
        )}
        
        {character.backstory && (
          <div className="mb-3">
            <h4 className="text-sm font-medium mb-1">Backstory</h4>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {character.backstory}
            </p>
          </div>
        )}
        
        {character.tags.length > 0 && (
          <div className="mb-3">
            <h4 className="text-sm font-medium mb-2">Tags</h4>
            <div className="flex flex-wrap gap-1">
              {character.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {character.notes && (
          <div>
            <h4 className="text-sm font-medium mb-1">Notes</h4>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {character.notes}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CharacterCard;
