
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Target } from 'lucide-react';
import { useStoryStructure } from '@/hooks/story/useStoryStructure';

const ThreeActStructure = () => {
  const { storyStructure, calculateActProgress } = useStoryStructure();

  const getActColor = (actNumber: 1 | 2 | 3) => {
    switch (actNumber) {
      case 1: return 'bg-blue-500';
      case 2: return 'bg-green-500';
      case 3: return 'bg-purple-500';
    }
  };

  const getActTextColor = (actNumber: 1 | 2 | 3) => {
    switch (actNumber) {
      case 1: return 'text-blue-600';
      case 2: return 'text-green-600';
      case 3: return 'text-purple-600';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Three-Act Structure
        </CardTitle>
        <CardDescription>
          Visualize your story's progression through the classic three-act structure
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {storyStructure.acts.map((act) => {
          const progress = calculateActProgress(act.number);
          const sceneCount = act.scenes.length;
          
          return (
            <div key={act.number} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full ${getActColor(act.number)} flex items-center justify-center text-white font-bold text-sm`}>
                    {act.number}
                  </div>
                  <div>
                    <h3 className={`font-semibold ${getActTextColor(act.number)}`}>
                      {act.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {act.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {sceneCount} scene{sceneCount !== 1 ? 's' : ''}
                  </Badge>
                  {act.targetWordCount && (
                    <Badge variant="secondary" className="text-xs">
                      <Target className="h-3 w-3 mr-1" />
                      {act.targetWordCount.toLocaleString()} words
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{progress.toFixed(0)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{act.actualWordCount.toLocaleString()} words written</span>
                  {act.targetWordCount && (
                    <span>{(act.targetWordCount - act.actualWordCount).toLocaleString()} remaining</span>
                  )}
                </div>
              </div>

              {act.scenes.length > 0 && (
                <div className="ml-11 space-y-1">
                  {act.scenes.slice(0, 3).map((scene, index) => (
                    <div key={scene.id} className="text-xs text-muted-foreground">
                      • {scene.title}
                    </div>
                  ))}
                  {act.scenes.length > 3 && (
                    <div className="text-xs text-muted-foreground">
                      ... and {act.scenes.length - 3} more scenes
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default ThreeActStructure;
