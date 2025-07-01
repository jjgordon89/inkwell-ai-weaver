import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Edit, 
  Archive, 
  Trash2, 
  Calendar, 
  Clock, 
  AlignLeft,
  ArrowLeft,
  Tag,
  BarChart2
} from 'lucide-react';
import { format } from 'date-fns';
import { useProject, useUpdateProject, useDeleteProject } from '@/hooks/queries/projectQueries';
import { useToast } from '@/hooks/use-toast';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { ProjectConfirmDialog } from '@/components/projects/ProjectConfirmDialog';

/**
 * Component to display and manage a single project
 */
const WritingProjectView: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
  
  const projectQuery = useProject(projectId);
  const updateProjectMutation = useUpdateProject();
  const deleteProjectMutation = useDeleteProject();
  
  const handleDeleteProject = async () => {
    if (!projectId) return;
    
    try {
      await deleteProjectMutation.mutateAsync({ id: projectId });
      toast({
        title: 'Success',
        description: 'Project deleted successfully',
        variant: 'default',
      });
      navigate('/projects');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: 'Error',
        description: `Failed to delete project: ${(error as Error).message}`,
        variant: 'destructive',
      });
    }
  };
  
  const handleArchiveProject = async () => {
    if (!projectId) return;
    
    try {
      await updateProjectMutation.mutateAsync({ 
        id: projectId, 
        data: { status: 'archived' } 
      });
      toast({
        title: 'Success',
        description: 'Project archived successfully',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error archiving project:', error);
      toast({
        title: 'Error',
        description: `Failed to archive project: ${(error as Error).message}`,
        variant: 'destructive',
      });
    }
  };
  
  const handleStartWriting = () => {
    navigate(`/studio/${projectId}`);
  };
  
  if (projectQuery.isLoading) {
    return (
      <div className="container max-w-6xl mx-auto p-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Skeleton className="h-10 w-1/3" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-64 w-full rounded-lg" />
          <Skeleton className="h-40 w-full rounded-lg" />
        </div>
      </div>
    );
  }
  
  if (projectQuery.error || !projectQuery.data) {
    return (
      <div className="container max-w-6xl mx-auto p-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Project Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The project you're looking for doesn't exist or couldn't be loaded.
          </p>
          <Button onClick={() => navigate('/projects')}>
            Back to Projects
          </Button>
        </div>
      </div>
    );
  }
  
  const project = projectQuery.data;
  
  return (
    <div className="container max-w-6xl mx-auto p-8">
      {/* Header */}
      <div className="flex items-start md:items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/projects")}
          aria-label="Back to Projects"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <Badge 
              variant={project.status === 'archived' ? 'secondary' : 'default'}
              className="capitalize"
            >
              {project.status}
            </Badge>
          </div>
          {project.description && (
            <p className="text-muted-foreground mt-1">{project.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsArchiveDialogOpen(true)}
            disabled={project.status === 'archived'}
          >
            <Archive className="h-4 w-4 mr-2" />
            Archive
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Project Details */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Overview</CardTitle>
              <CardDescription>Key details about your writing project</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Structure</div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <span className="capitalize">{project.structure}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Word Count</div>
                  <div className="flex items-center gap-2">
                    <AlignLeft className="h-4 w-4 text-primary" />
                    <span>{project.wordCount?.toLocaleString() || 0} words</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Created</div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>{format(new Date(project.createdAt), 'PP')}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Last Modified</div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>{format(new Date(project.lastModified), 'PP')}</span>
                  </div>
                </div>
                {project.template && (
                  <div className="space-y-2 col-span-2">
                    <div className="text-sm font-medium text-muted-foreground">Template</div>
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-primary" />
                      <span>{project.template}</span>
                    </div>
                  </div>
                )}
              </div>
              
              {project.wordCountTarget && (
                <div className="mt-6">
                  <div className="text-sm font-medium text-muted-foreground mb-2">Progress</div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>{Math.round((project.wordCount / project.wordCountTarget) * 100)}% Complete</span>
                      <span>{project.wordCount.toLocaleString()} / {project.wordCountTarget.toLocaleString()} words</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div 
                        className="bg-primary h-2.5 rounded-full" 
                        style={{ width: `${Math.min(100, Math.round((project.wordCount / project.wordCountTarget) * 100))}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={handleStartWriting} className="w-full">
                <Edit className="h-4 w-4 mr-2" />
                Continue Writing
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Project Analytics</CardTitle>
              <CardDescription>Insights and statistics about your writing</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="writing">
                <TabsList className="mb-4">
                  <TabsTrigger value="writing">Writing</TabsTrigger>
                  <TabsTrigger value="readability">Readability</TabsTrigger>
                  <TabsTrigger value="progress">Progress</TabsTrigger>
                </TabsList>
                <TabsContent value="writing" className="space-y-4">
                  <div className="flex items-center justify-center p-6 border rounded-lg">
                    <div className="text-center">
                      <BarChart2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Writing analytics will appear here as you work on your project
                      </p>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="readability">
                  <div className="flex items-center justify-center p-6 border rounded-lg">
                    <div className="text-center">
                      <BarChart2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Readability metrics will appear here as you work on your project
                      </p>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="progress">
                  <div className="flex items-center justify-center p-6 border rounded-lg">
                    <div className="text-center">
                      <BarChart2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Progress tracking will appear here as you work on your project
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        {/* Right Column - Quick Actions & Notes */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" onClick={handleStartWriting}>
                <Edit className="h-4 w-4 mr-2" />
                Continue Writing
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <AlignLeft className="h-4 w-4 mr-2" />
                Outline
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <BarChart2 className="h-4 w-4 mr-2" />
                View Statistics
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
              <CardDescription>Quick notes about your project</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center p-6 border rounded-lg">
                <div className="text-center">
                  <p className="text-muted-foreground">
                    Project notes will appear here
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <ProjectConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteProject}
        title="Delete Project"
        description="This will permanently delete this project and all its data. This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        destructive={true}
      />
      
      {/* Archive Confirmation Dialog */}
      <ProjectConfirmDialog
        open={isArchiveDialogOpen}
        onOpenChange={setIsArchiveDialogOpen}
        onConfirm={handleArchiveProject}
        title="Archive Project"
        description="This will archive the project. You can restore it later from the archive."
        confirmLabel="Archive"
        cancelLabel="Cancel"
      />
    </div>
  );
};

export default WritingProjectView;
