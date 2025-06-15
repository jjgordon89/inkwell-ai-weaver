
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus } from 'lucide-react';
import { Character, StoryArc, WorldElement } from '@/contexts/WritingContext';

interface QuickStatsProps {
  characters: Character[];
  storyArcs: StoryArc[];
  worldElements: WorldElement[];
  connectionsCount: number;
}

const QuickStats = ({ characters, storyArcs, worldElements, connectionsCount }: QuickStatsProps) => {
  return (
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
          <Badge variant="secondary">{characters.length}</Badge>
        </div>
        <div className="flex justify-between text-sm">
          <span>Story Arcs:</span>
          <Badge variant="secondary">{storyArcs.length}</Badge>
        </div>
        <div className="flex justify-between text-sm">
          <span>World Elements:</span>
          <Badge variant="secondary">{worldElements.length}</Badge>
        </div>
        <div className="flex justify-between text-sm">
          <span>Total Connections:</span>
          <Badge variant="secondary">{connectionsCount}</Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickStats;
