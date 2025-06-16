
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link, GitMerge, Globe } from 'lucide-react';

interface Connection {
  type: string;
  from: { id: string; name: string; title?: string };
  to: { id: string; name: string; title?: string };
  relationship: string;
}

interface StoryConnectionsProps {
  filteredConnections: Connection[];
}

const StoryConnections = ({ filteredConnections }: StoryConnectionsProps) => {
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
  );
};

export default StoryConnections;
