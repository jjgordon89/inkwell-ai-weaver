
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from 'lucide-react';

interface ContinuityNotesCardProps {
  notes: string[];
}

const ContinuityNotesCard: React.FC<ContinuityNotesCardProps> = ({ notes }) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Continuity Notes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {notes.map((note, index) => (
            <div key={index} className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="w-1 h-1 bg-primary rounded-full" />
              {note}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ContinuityNotesCard;
