
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { GitCompare, TrendingUp, TrendingDown, Eye, Lightbulb } from 'lucide-react';

interface VersionChange {
  type: 'addition' | 'deletion' | 'modification';
  content: string;
  position: number;
  aiInsight: string;
  impact: 'positive' | 'negative' | 'neutral';
}

interface VersionComparisonProps {
  originalVersion: string;
  currentVersion: string;
  onRestoreVersion?: () => void;
}

const VersionComparison: React.FC<VersionComparisonProps> = ({
  originalVersion,
  currentVersion,
  onRestoreVersion
}) => {
  const [changes, setChanges] = useState<VersionChange[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showInsights, setShowInsights] = useState(true);

  const analyzeVersions = async () => {
    if (!originalVersion || !currentVersion) return;

    setIsAnalyzing(true);
    try {
      // Mock analysis - in real implementation, this would use diff algorithms and AI
      const mockChanges: VersionChange[] = [
        {
          type: 'addition',
          content: 'The rain drummed against the window',
          position: 42,
          aiInsight: 'Added atmospheric detail enhances mood and setting',
          impact: 'positive'
        },
        {
          type: 'deletion',
          content: 'very quickly',
          position: 120,
          aiInsight: 'Removing adverb strengthens the prose',
          impact: 'positive'
        },
        {
          type: 'modification',
          content: 'walked → strode',
          position: 200,
          aiInsight: 'More specific verb choice improves character portrayal',
          impact: 'positive'
        },
        {
          type: 'addition',
          content: 'She hesitated, then...',
          position: 300,
          aiInsight: 'Builds tension effectively but may slow pacing',
          impact: 'neutral'
        }
      ];

      setChanges(mockChanges);
    } catch (error) {
      console.error('Failed to analyze versions:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getChangeIcon = (type: string) => {
    switch (type) {
      case 'addition': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'deletion': return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'modification': return <GitCompare className="h-4 w-4 text-blue-600" />;
      default: return null;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'positive': return 'bg-green-100 text-green-800';
      case 'negative': return 'bg-red-100 text-red-800';
      case 'neutral': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = {
    totalChanges: changes.length,
    additions: changes.filter(c => c.type === 'addition').length,
    deletions: changes.filter(c => c.type === 'deletion').length,
    modifications: changes.filter(c => c.type === 'modification').length,
    positiveImpact: changes.filter(c => c.impact === 'positive').length
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <GitCompare className="h-5 w-5 text-primary" />
            Version Comparison with AI Insights
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowInsights(!showInsights)}
            >
              <Eye className="h-4 w-4 mr-1" />
              {showInsights ? 'Hide' : 'Show'} Insights
            </Button>
            <Button
              onClick={analyzeVersions}
              disabled={isAnalyzing}
              size="sm"
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze Changes'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {changes.length === 0 && !isAnalyzing ? (
          <div className="text-center py-6 text-muted-foreground">
            <GitCompare className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Click "Analyze Changes" to compare versions</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 bg-muted/30 rounded-lg">
              <div className="text-center">
                <div className="font-bold text-lg">{stats.totalChanges}</div>
                <div className="text-xs text-muted-foreground">Total Changes</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg text-green-600">{stats.additions}</div>
                <div className="text-xs text-muted-foreground">Additions</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg text-red-600">{stats.deletions}</div>
                <div className="text-xs text-muted-foreground">Deletions</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg text-blue-600">{stats.modifications}</div>
                <div className="text-xs text-muted-foreground">Modifications</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg text-primary">{stats.positiveImpact}</div>
                <div className="text-xs text-muted-foreground">Improvements</div>
              </div>
            </div>

            <Separator />

            {/* Changes List */}
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {changes.map((change, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-start gap-3">
                      {getChangeIcon(change.type)}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="capitalize">
                            {change.type}
                          </Badge>
                          <Badge className={getImpactColor(change.impact)} variant="outline">
                            {change.impact}
                          </Badge>
                        </div>
                        
                        <div className="font-mono text-sm bg-muted p-2 rounded">
                          {change.content}
                        </div>
                        
                        {showInsights && (
                          <div className="flex items-start gap-2 p-2 bg-blue-50 rounded">
                            <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-blue-800">{change.aiInsight}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}

                {isAnalyzing && (
                  <div className="flex items-center justify-center py-8">
                    <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
                    <span className="text-sm text-muted-foreground">Analyzing changes...</span>
                  </div>
                )}
              </div>
            </ScrollArea>

            {onRestoreVersion && (
              <div className="flex justify-end pt-2 border-t">
                <Button variant="outline" onClick={onRestoreVersion}>
                  Restore Previous Version
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VersionComparison;
