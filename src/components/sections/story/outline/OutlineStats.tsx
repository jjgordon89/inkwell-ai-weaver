
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart3, Target, CheckCircle, FileText, BookOpen } from 'lucide-react';
import type { OutlineStructure } from '@/hooks/outline/types';

interface OutlineStatsProps {
  structure: OutlineStructure;
}

const OutlineStats = ({ structure }: OutlineStatsProps) => {
  const chapters = structure.items.filter(item => item.type === 'chapter');
  const scenes = structure.items.filter(item => item.type === 'scene');
  
  const completionPercentage = structure.totalItems > 0 
    ? (structure.completedItems / structure.totalItems) * 100 
    : 0;

  const totalEstimatedWords = structure.items.reduce((sum, item) => 
    sum + (item.estimatedWordCount || 0), 0
  );

  const progressPercentage = totalEstimatedWords > 0 
    ? (structure.totalWordCount / totalEstimatedWords) * 100 
    : 0;

  const statusCounts = structure.items.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Chapters</span>
          </div>
          <div className="text-2xl font-bold">{chapters.length}</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Scenes</span>
          </div>
          <div className="text-2xl font-bold">{scenes.length}</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium">Words</span>
          </div>
          <div className="text-2xl font-bold">
            {structure.totalWordCount.toLocaleString()}
          </div>
          {totalEstimatedWords > 0 && (
            <div className="text-xs text-muted-foreground mt-1">
              of {totalEstimatedWords.toLocaleString()} estimated
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">Completed</span>
          </div>
          <div className="text-2xl font-bold">
            {structure.completedItems}/{structure.totalItems}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {completionPercentage.toFixed(0)}% complete
          </div>
        </CardContent>
      </Card>

      {/* Progress bars */}
      <Card className="md:col-span-2">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Completion Progress</span>
                <span>{completionPercentage.toFixed(0)}%</span>
              </div>
              <Progress value={completionPercentage} className="h-2" />
            </div>
            
            {totalEstimatedWords > 0 && (
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Word Count Progress</span>
                  <span>{progressPercentage.toFixed(0)}%</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Status breakdown */}
      <Card className="md:col-span-2">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-4 w-4" />
            <span className="text-sm font-medium">Status Breakdown</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="bg-gray-50">
              Not Started: {statusCounts['not-started'] || 0}
            </Badge>
            <Badge variant="outline" className="bg-blue-50">
              In Progress: {statusCounts['in-progress'] || 0}
            </Badge>
            <Badge variant="outline" className="bg-green-50">
              Completed: {statusCounts['completed'] || 0}
            </Badge>
            <Badge variant="outline" className="bg-yellow-50">
              Needs Revision: {statusCounts['needs-revision'] || 0}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OutlineStats;
