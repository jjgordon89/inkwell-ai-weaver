
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Palette, BarChart3 } from 'lucide-react';

interface AIWritingSegment {
  start: number;
  end: number;
  type: 'original' | 'ai-assisted' | 'ai-generated';
  confidence: number;
  aiProvider?: string;
}

interface AIWritingHeatmapProps {
  content: string;
  isEnabled: boolean;
  onToggle: () => void;
}

const AIWritingHeatmap: React.FC<AIWritingHeatmapProps> = ({
  content,
  isEnabled,
  onToggle
}) => {
  const [segments, setSegments] = useState<AIWritingSegment[]>([]);
  const [showLegend, setShowLegend] = useState(true);
  const [selectedSegment, setSelectedSegment] = useState<AIWritingSegment | null>(null);

  // Mock AI content detection - in real implementation, this would track actual AI usage
  const detectAIContent = (text: string): AIWritingSegment[] => {
    const mockSegments: AIWritingSegment[] = [];
    const words = text.split(' ');
    let currentIndex = 0;

    // Simulate AI detection by creating random segments
    for (let i = 0; i < words.length; i += Math.floor(Math.random() * 20) + 10) {
      const segmentLength = Math.min(Math.floor(Math.random() * 15) + 5, words.length - i);
      const segmentEnd = i + segmentLength;
      
      const types: AIWritingSegment['type'][] = ['original', 'ai-assisted', 'ai-generated'];
      const randomType = types[Math.floor(Math.random() * types.length)];
      
      mockSegments.push({
        start: currentIndex,
        end: currentIndex + words.slice(i, segmentEnd).join(' ').length,
        type: randomType,
        confidence: Math.floor(Math.random() * 40) + 60,
        aiProvider: randomType !== 'original' ? 'GPT-4' : undefined
      });

      currentIndex += words.slice(i, segmentEnd).join(' ').length + 1;
    }

    return mockSegments;
  };

  useEffect(() => {
    if (content && isEnabled) {
      const detectedSegments = detectAIContent(content);
      setSegments(detectedSegments);
    }
  }, [content, isEnabled]);

  const getSegmentColor = (type: AIWritingSegment['type'], confidence: number) => {
    switch (type) {
      case 'original':
        return 'rgba(34, 197, 94, 0.2)'; // green
      case 'ai-assisted':
        return 'rgba(59, 130, 246, 0.3)'; // blue
      case 'ai-generated':
        return 'rgba(239, 68, 68, 0.3)'; // red
      default:
        return 'transparent';
    }
  };

  const getSegmentStats = () => {
    const total = segments.length;
    const original = segments.filter(s => s.type === 'original').length;
    const assisted = segments.filter(s => s.type === 'ai-assisted').length;
    const generated = segments.filter(s => s.type === 'ai-generated').length;

    return {
      total,
      original: Math.round((original / total) * 100) || 0,
      assisted: Math.round((assisted / total) * 100) || 0,
      generated: Math.round((generated / total) * 100) || 0
    };
  };

  const renderHighlightedContent = () => {
    if (!content || !isEnabled || segments.length === 0) {
      return <div className="p-4 text-muted-foreground">No content to analyze</div>;
    }

    let highlightedContent = content;
    let offset = 0;

    segments.forEach((segment, index) => {
      const color = getSegmentColor(segment.type, segment.confidence);
      const startTag = `<span 
        class="ai-segment cursor-pointer transition-opacity hover:opacity-75" 
        style="background-color: ${color}; border-radius: 2px; padding: 1px 2px;"
        data-segment="${index}"
        title="${segment.type} (${segment.confidence}% confidence)"
      >`;
      const endTag = '</span>';

      const start = segment.start + offset;
      const end = segment.end + offset;

      highlightedContent = 
        highlightedContent.slice(0, start) + 
        startTag + 
        highlightedContent.slice(start, end) + 
        endTag + 
        highlightedContent.slice(end);

      offset += startTag.length + endTag.length;
    });

    return (
      <div 
        className="p-4 text-sm leading-relaxed"
        dangerouslySetInnerHTML={{ __html: highlightedContent }}
        onClick={(e) => {
          const target = e.target as HTMLElement;
          if (target.classList.contains('ai-segment')) {
            const segmentIndex = parseInt(target.dataset.segment || '0');
            setSelectedSegment(segments[segmentIndex]);
          }
        }}
      />
    );
  };

  const stats = getSegmentStats();

  if (!isEnabled) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <Palette className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-3">
            Enable AI writing heatmap to visualize AI-assisted content
          </p>
          <Button onClick={onToggle} size="sm">
            <Eye className="h-4 w-4 mr-2" />
            Enable Heatmap
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Palette className="h-4 w-4" />
              AI Writing Heatmap
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowLegend(!showLegend)}>
                {showLegend ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              </Button>
              <Switch checked={isEnabled} onCheckedChange={onToggle} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {showLegend && (
            <div className="mb-4 p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium">Content Analysis</span>
                <Badge variant="outline" className="text-xs">
                  <BarChart3 className="h-3 w-3 mr-1" />
                  {segments.length} segments
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-green-200"></div>
                  <span>Original ({stats.original}%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-blue-200"></div>
                  <span>AI-Assisted ({stats.assisted}%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-red-200"></div>
                  <span>AI-Generated ({stats.generated}%)</span>
                </div>
              </div>
            </div>
          )}
          
          <div className="max-h-96 overflow-y-auto border rounded-lg">
            {renderHighlightedContent()}
          </div>

          {selectedSegment && (
            <div className="mt-3 p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={selectedSegment.type === 'original' ? 'secondary' : 'default'}>
                  {selectedSegment.type}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {selectedSegment.confidence}% confidence
                </span>
                {selectedSegment.aiProvider && (
                  <Badge variant="outline" className="text-xs">
                    {selectedSegment.aiProvider}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Click on highlighted text to see segment details
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AIWritingHeatmap;
