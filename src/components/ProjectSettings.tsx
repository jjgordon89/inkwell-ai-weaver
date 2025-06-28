
import React from 'react';
import { Settings, Target, FileText, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useProject } from '@/contexts/ProjectContext';

const ProjectSettings = () => {
  const { state } = useProject();

  const projectStats = {
    totalWords: state.flatDocuments.reduce((sum, doc) => sum + (doc.wordCount || 0), 0),
    totalDocs: state.flatDocuments.length,
    chaptersCount: state.flatDocuments.filter(doc => doc.type === 'chapter').length,
    scenesCount: state.flatDocuments.filter(doc => doc.type === 'scene').length
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Project Settings</h3>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4" />
            Project Goals
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="target-words">Target Word Count</Label>
            <Input
              id="target-words"
              type="number"
              placeholder="50000"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="deadline">Target Completion Date</Label>
            <Input
              id="deadline"
              type="date"
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Project Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium">{projectStats.totalWords.toLocaleString()}</div>
              <div className="text-muted-foreground">Total Words</div>
            </div>
            <div>
              <div className="font-medium">{projectStats.totalDocs}</div>
              <div className="text-muted-foreground">Documents</div>
            </div>
            <div>
              <div className="font-medium">{projectStats.chaptersCount}</div>
              <div className="text-muted-foreground">Chapters</div>
            </div>
            <div>
              <div className="font-medium">{projectStats.scenesCount}</div>
              <div className="text-muted-foreground">Scenes</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Project Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Add notes about your project..."
            rows={4}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectSettings;
