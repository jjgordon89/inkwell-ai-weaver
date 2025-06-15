
import React, { useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Network } from 'lucide-react';

interface Node {
  id: string;
  name: string;
  group: string;
}

interface Link {
  source: string;
  target: string;
  type: string;
  description: string;
}

interface CharacterRelationshipMapProps {
  nodes: Node[];
  links: Link[];
}

const CharacterRelationshipMap = ({ nodes, links }: CharacterRelationshipMapProps) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    const svg = svgRef.current;
    const width = 400;
    const height = 300;
    
    // Clear previous content
    svg.innerHTML = '';
    
    // Position nodes in a circle
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 3;
    
    const nodePositions = new Map();
    nodes.forEach((node, index) => {
      const angle = (index / nodes.length) * 2 * Math.PI;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      nodePositions.set(node.id, { x, y });
    });

    // Draw links
    links.forEach(link => {
      const sourcePos = nodePositions.get(link.source);
      const targetPos = nodePositions.get(link.target);
      
      if (sourcePos && targetPos) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', sourcePos.x.toString());
        line.setAttribute('y1', sourcePos.y.toString());
        line.setAttribute('x2', targetPos.x.toString());
        line.setAttribute('y2', targetPos.y.toString());
        line.setAttribute('stroke', '#64748b');
        line.setAttribute('stroke-width', '2');
        line.setAttribute('opacity', '0.6');
        svg.appendChild(line);
        
        // Add relationship type label
        const midX = (sourcePos.x + targetPos.x) / 2;
        const midY = (sourcePos.y + targetPos.y) / 2;
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', midX.toString());
        text.setAttribute('y', midY.toString());
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', '#64748b');
        text.setAttribute('font-size', '10');
        text.textContent = link.type;
        svg.appendChild(text);
      }
    });

    // Draw nodes
    nodes.forEach(node => {
      const pos = nodePositions.get(node.id);
      if (pos) {
        // Node circle
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', pos.x.toString());
        circle.setAttribute('cy', pos.y.toString());
        circle.setAttribute('r', '20');
        circle.setAttribute('fill', node.group === 'main' ? '#3b82f6' : '#10b981');
        circle.setAttribute('stroke', '#ffffff');
        circle.setAttribute('stroke-width', '2');
        svg.appendChild(circle);
        
        // Node label
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', pos.x.toString());
        text.setAttribute('y', (pos.y + 35).toString());
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', '#1f2937');
        text.setAttribute('font-size', '12');
        text.setAttribute('font-weight', '500');
        text.textContent = node.name;
        svg.appendChild(text);
      }
    });
  }, [nodes, links]);

  if (nodes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Character Relationships
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No character relationships to display. Add relationships between characters to see the network visualization.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Network className="h-5 w-5" />
          Character Relationships
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <svg
            ref={svgRef}
            width="100%"
            height="300"
            viewBox="0 0 400 300"
            className="border rounded-lg bg-muted/20"
          />
        </div>
        
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Legend</h4>
          <div className="flex gap-2 flex-wrap">
            <Badge variant="outline" className="bg-blue-500/10 border-blue-500/20">
              Main Characters
            </Badge>
            <Badge variant="outline" className="bg-green-500/10 border-green-500/20">
              Supporting Characters
            </Badge>
          </div>
        </div>
        
        {links.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="text-sm font-medium">Relationships</h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {links.map((link, index) => {
                const sourceName = nodes.find(n => n.id === link.source)?.name;
                const targetName = nodes.find(n => n.id === link.target)?.name;
                return (
                  <div key={index} className="text-xs text-muted-foreground">
                    {sourceName} → {targetName}: {link.type}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CharacterRelationshipMap;
