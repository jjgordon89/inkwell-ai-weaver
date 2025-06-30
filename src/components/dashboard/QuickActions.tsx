import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  FileText, 
  Settings, 
  Download, 
  Upload, 
  Search,
  BookOpen,
  Target,
  Calendar,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Project } from '@/types/document';

interface QuickActionsProps {
  projects: Project[];
  className?: string;
}

const QuickActions: React.FC<QuickActionsProps> = ({ projects, className = '' }) => {
  const navigate = useNavigate();
  
  // Get suggestions based on current projects
  const recentProject = projects
    .filter(p => p.status === 'active')
    .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())[0];
  
  const draftProjects = projects.filter(p => p.status === 'draft');
  const completedProjects = projects.filter(p => p.status === 'complete');

  const quickActions = [
    {
      icon: <Plus className="h-4 w-4" />,
      title: "New Project",
      description: "Start a new writing project",
      action: () => navigate('/projects/new'),
      variant: "default" as const,
      shortcut: "Ctrl+N"
    },
    {
      icon: <FileText className="h-4 w-4" />,
      title: "Continue Writing",
      description: recentProject ? `Resume "${recentProject.name}"` : "No active projects",
      action: () => recentProject && navigate(`/studio/${recentProject.id}`),
      variant: "outline" as const,
      disabled: !recentProject,
      shortcut: "Ctrl+W"
    },
    {
      icon: <Search className="h-4 w-4" />,
      title: "Search Projects",
      description: "Find projects, documents, or notes",
      action: () => {
        // In a real app, this would open a search modal
        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      },
      variant: "outline" as const,
      shortcut: "Ctrl+K"
    },
    {
      icon: <Settings className="h-4 w-4" />,
      title: "Settings",
      description: "Configure writing preferences",
      action: () => navigate('/settings'),
      variant: "outline" as const,
      shortcut: "Ctrl+,"
    }
  ];

  const suggestions = [
    ...(draftProjects.length > 0 ? [{
      icon: <BookOpen className="h-4 w-4" />,
      title: "Complete Drafts",
      description: `You have ${draftProjects.length} draft project${draftProjects.length > 1 ? 's' : ''}`,
      badge: draftProjects.length.toString(),
      badgeVariant: "secondary" as const
    }] : []),
    ...(completedProjects.length > 0 ? [{
      icon: <Download className="h-4 w-4" />,
      title: "Export Completed",
      description: `Export ${completedProjects.length} completed project${completedProjects.length > 1 ? 's' : ''}`,
      badge: completedProjects.length.toString(),
      badgeVariant: "default" as const
    }] : []),
    {
      icon: <Target className="h-4 w-4" />,
      title: "Set Writing Goals",
      description: "Define daily or weekly writing targets",
      badge: "New",
      badgeVariant: "destructive" as const
    },
    {
      icon: <Calendar className="h-4 w-4" />,
      title: "Writing Schedule",
      description: "Plan your writing sessions",
      badge: "Beta",
      badgeVariant: "outline" as const
    }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant}
                className="h-auto p-4 justify-start"
                onClick={action.action}
                disabled={action.disabled}
              >
                <div className="flex items-start gap-3 w-full">
                  <div className="mt-0.5">{action.icon}</div>
                  <div className="flex-1 text-left">
                    <div className="font-medium">{action.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {action.description}
                    </div>
                    {action.shortcut && (
                      <div className="text-xs text-muted-foreground mt-1 opacity-70">
                        {action.shortcut}
                      </div>
                    )}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle>Suggestions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent cursor-pointer transition-colors"
              >
                <div className="text-muted-foreground">{suggestion.icon}</div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{suggestion.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {suggestion.description}
                  </div>
                </div>
                <Badge variant={suggestion.badgeVariant}>
                  {suggestion.badge}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Import/Export Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Import & Export</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Upload className="mr-2 h-4 w-4" />
              Import from File
              <Badge variant="outline" className="ml-auto">
                .docx, .txt
              </Badge>
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Download className="mr-2 h-4 w-4" />
              Export All Projects
              <Badge variant="outline" className="ml-auto">
                .zip
              </Badge>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Files */}
      {recentProject && (
        <Card>
          <CardHeader>
            <CardTitle>Continue Where You Left Off</CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent cursor-pointer transition-colors"
              onClick={() => navigate(`/studio/${recentProject.id}`)}
            >
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <div className="font-medium text-sm">{recentProject.name}</div>
                <div className="text-xs text-muted-foreground">
                  Last modified: {new Date(recentProject.lastModified).toLocaleDateString()}
                </div>
              </div>
              <Badge variant={
                recentProject.status === 'active' ? 'default' :
                recentProject.status === 'complete' ? 'secondary' : 'outline'
              }>
                {recentProject.status}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QuickActions;
