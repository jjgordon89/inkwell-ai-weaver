import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, TrendingUp, Clock, Target } from 'lucide-react';
import type { Project } from '@/types/document';
import { format } from 'date-fns';

interface ProjectStatsProps {
  projects: Project[];
}

const ProjectStats: React.FC<ProjectStatsProps> = ({ projects }) => {
  // Calculate comprehensive statistics
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const completedProjects = projects.filter(p => p.status === 'complete').length;
  const draftProjects = projects.filter(p => p.status === 'draft').length;
  const revisionProjects = projects.filter(p => p.status === 'revision').length;
  
  const totalWordTarget = projects.reduce((sum, p) => sum + (p.wordCountTarget || 0), 0);
  const averageWordTarget = totalProjects > 0 ? Math.round(totalWordTarget / totalProjects) : 0;
  
  // Calculate completion rate
  const completionRate = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;
  
  // Get recently active projects
  const recentlyModified = projects
    .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
    .slice(0, 3);
    
  // Calculate projects by structure
  const structureStats = projects.reduce((acc, project) => {
    const structure = project.structure || 'other';
    acc[structure] = (acc[structure] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const mostPopularStructure = Object.entries(structureStats).reduce((a, b) => 
    structureStats[a[0]] > structureStats[b[0]] ? a : b, ['novel', 0]
  )[0];

  return (
    <div className="space-y-6 mb-8">
      {/* Main Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Projects */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              {activeProjects} active, {completedProjects} completed
            </p>
            <div className="flex gap-1 mt-2">
              <Badge variant="secondary" className="text-xs">
                {completionRate}% complete
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Active Projects */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProjects}</div>
            <p className="text-xs text-muted-foreground">
              {draftProjects} drafts, {revisionProjects} in revision
            </p>
            <div className="flex gap-1 mt-2">
              <Badge variant="outline" className="text-xs">
                {mostPopularStructure}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Word Target */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Word Targets</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWordTarget.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Avg. {averageWordTarget.toLocaleString()} per project
            </p>
            <div className="flex gap-1 mt-2">
              <Badge variant="secondary" className="text-xs">
                Total target
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentlyModified.length > 0 ? recentlyModified.slice(0, 2).map((project) => (
                <div key={project.id} className="text-xs">
                  <div className="font-medium truncate">{project.name}</div>
                  <div className="text-muted-foreground">
                    {format(new Date(project.lastModified), 'MMM d, HH:mm')}
                  </div>
                </div>
              )) : (
                <div className="text-xs text-muted-foreground">
                  No recent activity
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Statistics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Project Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Project Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Active</span>
                <Badge className="bg-green-500">{activeProjects}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Draft</span>
                <Badge className="bg-yellow-500">{draftProjects}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Revision</span>
                <Badge className="bg-orange-500">{revisionProjects}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Complete</span>
                <Badge className="bg-indigo-500">{completedProjects}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Project Structure Types */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Project Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(structureStats).map(([structure, count]) => (
                <div key={structure} className="flex justify-between items-center">
                  <span className="text-sm capitalize">{structure}</span>
                  <Badge variant="outline">{count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Projects */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recently Modified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentlyModified.slice(0, 3).map((project) => (
                <div key={project.id} className="border-l-2 border-primary pl-3">
                  <div className="font-medium text-sm truncate">{project.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(project.lastModified), 'MMM d, yyyy • HH:mm')}
                  </div>
                  <Badge variant="outline" className="text-xs mt-1">
                    {project.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProjectStats;
