
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  GitMerge, 
  Users, 
  MapPin, 
  Zap, 
  Plus, 
  Search,
  Eye,
  Edit3,
  Trash2
} from 'lucide-react';

interface StoryNode {
  id: string;
  type: 'plot' | 'character' | 'location' | 'theme';
  title: string;
  description: string;
  connections: string[];
  position: { x: number; y: number };
  importance: 'low' | 'medium' | 'high';
  status: 'planned' | 'in-progress' | 'completed';
}

interface Connection {
  from: string;
  to: string;
  type: 'causes' | 'influences' | 'related-to' | 'conflicts-with';
  strength: number; // 1-5
}

interface InteractiveStoryMappingProps {
  onGenerateMap: () => void;
  isGenerating?: boolean;
}

const InteractiveStoryMapping: React.FC<InteractiveStoryMappingProps> = ({
  onGenerateMap,
  isGenerating = false
}) => {
  const [nodes, setNodes] = useState<StoryNode[]>([
    {
      id: '1',
      type: 'plot',
      title: 'Opening Conflict',
      description: 'The inciting incident that sets the story in motion',
      connections: ['2', '3'],
      position: { x: 100, y: 100 },
      importance: 'high',
      status: 'completed'
    },
    {
      id: '2',
      type: 'character',
      title: 'Protagonist',
      description: 'Main character facing the central conflict',
      connections: ['1', '4'],
      position: { x: 300, y: 150 },
      importance: 'high',
      status: 'in-progress'
    },
    {
      id: '3',
      type: 'location',
      title: 'Central Setting',
      description: 'Primary location where events unfold',
      connections: ['1', '4'],
      position: { x: 150, y: 250 },
      importance: 'medium',
      status: 'planned'
    },
    {
      id: '4',
      type: 'theme',
      title: 'Core Theme',
      description: 'Central message or meaning of the story',
      connections: ['2', '3'],
      position: { x: 250, y: 300 },
      importance: 'high',
      status: 'in-progress'
    }
  ]);

  const [connections] = useState<Connection[]>([
    { from: '1', to: '2', type: 'causes', strength: 5 },
    { from: '1', to: '3', type: 'related-to', strength: 4 },
    { from: '2', to: '4', type: 'influences', strength: 4 },
    { from: '3', to: '4', type: 'influences', strength: 3 }
  ]);

  const [selectedNode, setSelectedNode] = useState<StoryNode | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const getNodeIcon = (type: StoryNode['type']) => {
    switch (type) {
      case 'plot': return <GitMerge className="h-4 w-4" />;
      case 'character': return <Users className="h-4 w-4" />;
      case 'location': return <MapPin className="h-4 w-4" />;
      case 'theme': return <Zap className="h-4 w-4" />;
    }
  };

  const getNodeColor = (type: StoryNode['type'], importance: StoryNode['importance']) => {
    const baseColors = {
      plot: 'bg-blue-100 border-blue-300 text-blue-800',
      character: 'bg-green-100 border-green-300 text-green-800',
      location: 'bg-purple-100 border-purple-300 text-purple-800',
      theme: 'bg-orange-100 border-orange-300 text-orange-800'
    };

    const importanceModifier = importance === 'high' ? ' ring-2 ring-offset-1' : '';
    return baseColors[type] + importanceModifier;
  };

  const getStatusColor = (status: StoryNode['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-yellow-500';
      case 'planned': return 'bg-gray-400';
    }
  };

  const filteredNodes = nodes.filter(node =>
    node.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    node.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getConnectionStats = () => {
    const totalConnections = connections.length;
    const strongConnections = connections.filter(c => c.strength >= 4).length;
    const nodesByType = nodes.reduce((acc, node) => {
      acc[node.type] = (acc[node.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { totalConnections, strongConnections, nodesByType };
  };

  const stats = getConnectionStats();

  const handleNodeClick = (node: StoryNode) => {
    setSelectedNode(node);
  };

  const handleAddNode = () => {
    const newNode: StoryNode = {
      id: Date.now().toString(),
      type: 'plot',
      title: 'New Node',
      description: 'Description...',
      connections: [],
      position: { x: Math.random() * 300 + 50, y: Math.random() * 300 + 50 },
      importance: 'medium',
      status: 'planned'
    };
    setNodes([...nodes, newNode]);
    setSelectedNode(newNode);
    setIsEditMode(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitMerge className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Interactive Story Map</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsEditMode(!isEditMode)}>
            <Edit3 className="h-4 w-4 mr-2" />
            {isEditMode ? 'View Mode' : 'Edit Mode'}
          </Button>
          <Button onClick={onGenerateMap} disabled={isGenerating} size="sm">
            {isGenerating ? 'Generating...' : 'AI Generate'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Story Map Visualization */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Story Structure</CardTitle>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Search nodes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-40 h-8"
                  />
                  {isEditMode && (
                    <Button size="sm" variant="outline" onClick={handleAddNode}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative bg-muted/20 rounded-lg p-4 h-96 overflow-auto">
                {/* Story Nodes */}
                {filteredNodes.map((node) => (
                  <div
                    key={node.id}
                    className={`absolute cursor-pointer transition-all duration-200 hover:scale-105 ${
                      selectedNode?.id === node.id ? 'ring-2 ring-primary' : ''
                    }`}
                    style={{
                      left: `${node.position.x}px`,
                      top: `${node.position.y}px`,
                      width: '140px'
                    }}
                    onClick={() => handleNodeClick(node)}
                  >
                    <div className={`p-3 rounded-lg border-2 ${getNodeColor(node.type, node.importance)}`}>
                      <div className="flex items-center gap-2 mb-1">
                        {getNodeIcon(node.type)}
                        <span className="text-xs font-medium truncate">{node.title}</span>
                        <div 
                          className={`w-2 h-2 rounded-full ${getStatusColor(node.status)}`}
                          title={node.status}
                        />
                      </div>
                      <p className="text-xs opacity-80 line-clamp-2">{node.description}</p>
                    </div>
                  </div>
                ))}

                {/* Connection Lines - Simplified representation */}
                <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
                  {connections.map((connection, index) => {
                    const fromNode = nodes.find(n => n.id === connection.from);
                    const toNode = nodes.find(n => n.id === connection.to);
                    if (!fromNode || !toNode) return null;

                    return (
                      <line
                        key={index}
                        x1={fromNode.position.x + 70}
                        y1={fromNode.position.y + 30}
                        x2={toNode.position.x + 70}
                        y2={toNode.position.y + 30}
                        stroke="hsl(var(--muted-foreground))"
                        strokeWidth={connection.strength}
                        strokeDasharray={connection.type === 'conflicts-with' ? '5,5' : undefined}
                        opacity={0.4}
                      />
                    );
                  })}
                </svg>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Node Details & Stats */}
        <div className="space-y-4">
          {/* Stats Overview */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Map Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Total Nodes</span>
                  <div className="font-medium">{nodes.length}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Connections</span>
                  <div className="font-medium">{stats.totalConnections}</div>
                </div>
              </div>
              
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Node Types</span>
                {Object.entries(stats.nodesByType).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1">
                      {getNodeIcon(type as StoryNode['type'])}
                      <span className="capitalize">{type}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">{count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Selected Node Details */}
          {selectedNode && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  {getNodeIcon(selectedNode.type)}
                  {selectedNode.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {selectedNode.type}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {selectedNode.importance} importance
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(selectedNode.status)}`} />
                    <span className="text-xs text-muted-foreground capitalize">
                      {selectedNode.status}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-medium">Description</span>
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedNode.description}
                  </p>
                </div>

                {selectedNode.connections.length > 0 && (
                  <div>
                    <span className="text-xs font-medium">Connected to</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedNode.connections.map(connId => {
                        const connectedNode = nodes.find(n => n.id === connId);
                        return connectedNode ? (
                          <Badge key={connId} variant="secondary" className="text-xs">
                            {connectedNode.title}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}

                {isEditMode && (
                  <div className="pt-2 border-t">
                    <Button size="sm" variant="outline" className="w-full">
                      <Edit3 className="h-3 w-3 mr-2" />
                      Edit Node
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default InteractiveStoryMapping;
