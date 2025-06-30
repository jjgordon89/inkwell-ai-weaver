import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, Calendar } from 'lucide-react';
import type { Project } from '@/types/document';
import { format, subDays, isAfter } from 'date-fns';

interface ProjectAnalyticsProps {
  projects: Project[];
  className?: string;
}

interface ActivityData {
  date: string;
  projects: number;
  words: number;
}

const ProjectAnalytics: React.FC<ProjectAnalyticsProps> = ({ projects, className = '' }) => {
  // Generate activity data for the last 7 days
  const generateActivityData = (): ActivityData[] => {
    const data: ActivityData[] = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      const dateStr = format(date, 'MMM dd');
      
      // Count projects modified on this date
      const projectsModified = projects.filter(project => {
        const modifiedDate = new Date(project.lastModified);
        return format(modifiedDate, 'MMM dd') === dateStr;
      }).length;
      
      // Estimate words written (this would come from actual writing session data)
      const wordsWritten = projectsModified * Math.floor(Math.random() * 500 + 200);
      
      data.push({
        date: dateStr,
        projects: projectsModified,
        words: wordsWritten
      });
    }
    
    return data;
  };

  const activityData = generateActivityData();
  const maxProjects = Math.max(...activityData.map(d => d.projects), 1);
  const maxWords = Math.max(...activityData.map(d => d.words), 1);
  
  // Calculate productivity metrics
  const activeThisWeek = projects.filter(project => {
    const modifiedDate = new Date(project.lastModified);
    const weekAgo = subDays(new Date(), 7);
    return isAfter(modifiedDate, weekAgo);
  }).length;
  
  const totalWordsThisWeek = activityData.reduce((sum, day) => sum + day.words, 0);
  const avgWordsPerDay = Math.round(totalWordsThisWeek / 7);
  
  // Writing streak calculation (simplified)
  const writingStreak = Math.floor(Math.random() * 14) + 1; // Mock data
  
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Activity</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeThisWeek}</div>
            <p className="text-xs text-muted-foreground">
              Projects worked on this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Words This Week</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWordsThisWeek.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Avg. {avgWordsPerDay} words/day
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Writing Streak</CardTitle>
            <Badge className="bg-orange-500">{writingStreak} days</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{writingStreak}</div>
            <p className="text-xs text-muted-foreground">
              Consecutive writing days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            7-Day Activity Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Projects Chart */}
            <div>
              <h4 className="text-sm font-medium mb-2">Projects Modified</h4>
              <div className="flex items-end space-x-2 h-20">
                {activityData.map((day, index) => {
                  const height = (day.projects / maxProjects) * 100;
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600"
                        style={{ height: `${Math.max(height, 4)}%` }}
                        title={`${day.projects} projects on ${day.date}`}
                      />
                      <span className="text-xs text-muted-foreground mt-1 rotate-45 origin-bottom-left">
                        {day.date}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Words Chart */}
            <div>
              <h4 className="text-sm font-medium mb-2">Words Written (Estimated)</h4>
              <div className="flex items-end space-x-2 h-20">
                {activityData.map((day, index) => {
                  const height = (day.words / maxWords) * 100;
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-green-500 rounded-t transition-all duration-300 hover:bg-green-600"
                        style={{ height: `${Math.max(height, 4)}%` }}
                        title={`${day.words} words on ${day.date}`}
                      />
                      <span className="text-xs text-muted-foreground mt-1">
                        {day.words > 0 ? Math.round(day.words / 100) * 100 : 0}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Writing Goals & Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Writing Goals Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {projects.filter(p => p.status === 'active').slice(0, 3).map((project) => {
              // Mock current word count (in real app this would come from documents)
              const currentWords = Math.floor((project.wordCountTarget || 0) * (Math.random() * 0.8 + 0.1));
              const progress = project.wordCountTarget ? (currentWords / project.wordCountTarget) * 100 : 0;
              
              return (
                <div key={project.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium truncate">{project.name}</span>
                    <Badge variant="outline">
                      {currentWords.toLocaleString()} / {(project.wordCountTarget || 0).toLocaleString()}
                    </Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {progress.toFixed(1)}% complete
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectAnalytics;
