import React, { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, 
  SelectTrigger, 
  SelectValue, 
  SelectContent, 
  SelectItem 
} from "@/components/ui/select";
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { 
  AlertDialog, 
  AlertDialogTrigger, 
  AlertDialogContent, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogAction, 
  AlertDialogCancel 
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import LoadingSpinner from "@/components/ui/loading-spinner";
import ProjectStats from "@/components/dashboard/ProjectStats";
import ProjectAnalytics from "@/components/dashboard/ProjectAnalytics";
import QuickActions from "@/components/dashboard/QuickActions";
import { Plus, Search, Trash, Archive, FileEdit, MoreVertical, ChevronLeft, ChevronRight, BookOpen, BarChart3, Zap, Grid3X3 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { sanitizeString } from "@/utils/stringUtils";
import { useProjects, useUpdateProject, useDeleteProject } from "@/hooks/queries/useProjectQueries";
import type { ProjectFilters } from "@/types/projectTypes";

const PROJECTS_PER_PAGE = 9;

const ProjectsPage = () => {
  // Local state for UI
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterStructure, setFilterStructure] = useState("all");
  const [sortBy, setSortBy] = useState<string>("lastModified");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [archiveId, setArchiveId] = useState<string | null>(null);

  const { toast } = useToast();
  const navigate = useNavigate();

  // Create filter object for projects query
  const filters: ProjectFilters = useMemo(() => {
    const result: ProjectFilters = {};
    if (searchQuery && searchQuery.trim() !== '') {
      result.searchQuery = searchQuery;
    }
    if (filterStatus && filterStatus !== 'all') {
      result.status = filterStatus;
    }
    if (filterStructure && filterStructure !== 'all') {
      result.structure = filterStructure;
    }
    return result;
  }, [searchQuery, filterStatus, filterStructure]);

  // TanStack Query hooks
  const projectsQuery = useProjects(filters);
  const updateProjectMutation = useUpdateProject();
  const deleteProjectMutation = useDeleteProject();
  
  // Derived state
  const isLoading = projectsQuery.isLoading || updateProjectMutation.isPending || deleteProjectMutation.isPending;
  const projects = useMemo(() => projectsQuery.data || [], [projectsQuery.data]);

  // Show error toast if there's an error in the query
  useEffect(() => {
    if (projectsQuery.error) {
      toast({
        title: "Error",
        description: projectsQuery.error.message,
        variant: "destructive",
      });
    }
  }, [projectsQuery.error, toast]);

  // Filter and sort logic
  const filteredProjects = useMemo(() => {
    const list = [...projects];
    
    // Apply sorting
    switch (sortBy) {
      case "lastModified":
        list.sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());
        break;
      case "createdAt":
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "name":
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "status":
        list.sort((a, b) => a.status.localeCompare(b.status));
        break;
      case "structure":
        list.sort((a, b) => (a.structure || "").localeCompare(b.structure || ""));
        break;
    }
    
    return list;
  }, [projects, sortBy]);

  // Pagination logic
  const totalPages = Math.ceil(filteredProjects.length / PROJECTS_PER_PAGE);
  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * PROJECTS_PER_PAGE;
    return filteredProjects.slice(start, start + PROJECTS_PER_PAGE);
  }, [filteredProjects, currentPage]);

  // Reset to first page if filter/search changes
  useEffect(() => {
    if (currentPage > Math.max(1, totalPages)) {
      setCurrentPage(1);
    }
  }, [filteredProjects, totalPages, currentPage]);

  // UI Event Handlers
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  const handleFilter = (value: string) => {
    setFilterStatus(value);
  };
  
  const handleStructureFilter = (value: string) => {
    setFilterStructure(value);
  };
  
  const handleSort = (value: string) => {
    setSortBy(value);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProjectMutation.mutateAsync(id);
      setDeleteId(null);
      toast({
        title: "Success",
        description: "Project deleted successfully",
        variant: "default",
      });
    } catch (error) {
      console.error("Error deleting project:", error);
      // Error toast is shown by the mutation
    }
  };
  
  const handleArchive = async (id: string) => {
    try {
      await updateProjectMutation.mutateAsync({ 
        id, 
        updates: { status: "archived" } 
      });
      setArchiveId(null);
      toast({
        title: "Success",
        description: "Project archived successfully",
        variant: "default",
      });
    } catch (error) {
      console.error("Error archiving project:", error);
      // Error toast is shown by the mutation
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "draft":
        return <Badge className="bg-yellow-500">Draft</Badge>;
      case "revision":
        return <Badge className="bg-orange-500">Revision</Badge>;
      case "editing":
        return <Badge className="bg-blue-500">Editing</Badge>;
      case "complete":
        return <Badge className="bg-indigo-500">Complete</Badge>;
      case "archived":
        return <Badge variant="secondary">Archived</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Render loading skeletons
  if (isLoading && projects.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner 
          size="lg" 
          text="Loading your projects..." 
          color="primary" 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-8">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold">My Projects</h1>
          <Button onClick={() => navigate("/projects/new")} className="self-start sm:self-auto">
            <Plus className="mr-2 h-4 w-4" />
            Create New Project
          </Button>
        </header>
        
        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Grid3X3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              All Projects
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="actions" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Quick Actions
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab - Dashboard with stats */}
          <TabsContent value="overview" className="mt-6">
            <ProjectStats projects={projects} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ProjectAnalytics projects={projects} />
              </div>
              <div>
                <QuickActions projects={projects} />
              </div>
            </div>
          </TabsContent>

          {/* Projects Tab - Existing projects list */}
          <TabsContent value="projects" className="mt-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative md:w-1/3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search projects..." 
              value={searchQuery} 
              onChange={handleSearch} 
              className="pl-9"
              aria-label="Search projects" 
            />
          </div>
          
          <Select value={filterStatus} onValueChange={handleFilter}>
            <SelectTrigger className="md:w-40" aria-label="Filter by status">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="revision">Revision</SelectItem>
              <SelectItem value="editing">Editing</SelectItem>
              <SelectItem value="complete">Complete</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterStructure} onValueChange={handleStructureFilter}>
            <SelectTrigger className="md:w-40" aria-label="Filter by structure">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="novel">Novel</SelectItem>
              <SelectItem value="screenplay">Screenplay</SelectItem>
              <SelectItem value="research">Research</SelectItem>
              <SelectItem value="poetry">Poetry</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={handleSort}>
            <SelectTrigger className="md:w-40" aria-label="Sort by">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lastModified">Last Modified</SelectItem>
              <SelectItem value="createdAt">Created Date</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="status">Status</SelectItem>
              <SelectItem value="structure">Structure</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No projects found</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              {searchQuery || filterStatus !== 'all' || filterStructure !== 'all'
                ? "Try changing your search or filter criteria." 
                : "You haven't created any projects yet. Get started by creating your first project!"}
            </p>
            <Button onClick={() => navigate("/projects/new")}>
              <Plus className="mr-2 h-4 w-4" />
              Create New Project
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedProjects.map((project) => (
                <Card 
                  key={project.id} 
                  className="overflow-hidden flex flex-col cursor-pointer hover:shadow-md transition-shadow duration-200"
                  onClick={(e) => {
                    // Prevent navigation if clicking on dropdown menu or its children
                    if (e.target instanceof Element && (
                      e.target.closest('button') || 
                      e.target.closest('[role="menu"]')
                    )) {
                      return;
                    }
                    navigate(`/studio/${project.id}`);
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Open project: ${project.name}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigate(`/studio/${project.id}`);
                    }
                  }}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl font-semibold text-primary">{project.name}</CardTitle>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label="Project actions">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/studio/${project.id}`)}>
                            <FileEdit className="mr-2 h-4 w-4" />
                            Open
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {project.status !== 'archived' && (
                            <DropdownMenuItem onClick={() => setArchiveId(project.id)}>
                              <Archive className="mr-2 h-4 w-4" />
                              Archive
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={() => setDeleteId(project.id)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusBadge(project.status)}
                      {project.structure && (
                        <Badge variant="outline" className="capitalize">
                          {project.structure}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="flex-grow">
                    <p className="text-muted-foreground text-sm">
                      {project.description 
                        ? sanitizeString(project.description) 
                        : "No description provided."}
                    </p>
                  </CardContent>
                  
                  <CardFooter className="pt-2 text-xs text-muted-foreground flex flex-col items-start gap-1">
                    <div className="flex flex-wrap gap-x-4 gap-y-1 w-full">
                      <div>Created: {format(new Date(project.createdAt), 'MMM d, yyyy')}</div>
                      <div>Modified: {format(new Date(project.lastModified), 'MMM d, yyyy')}</div>
                      {project.wordCountTarget && (
                        <div className="flex items-center">
                          <span>Target: {project.wordCountTarget.toLocaleString()} words</span>
                        </div>
                      )}
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-8 gap-1">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="mx-4 text-sm">
                  Page {currentPage} of {totalPages}
                </div>
                
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="mt-6">
            <ProjectAnalytics projects={projects} />
          </TabsContent>

          {/* Quick Actions Tab */}
          <TabsContent value="actions" className="mt-6">
            <QuickActions projects={projects} />
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this project and all its data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Archive Confirmation Dialog */}
      <AlertDialog open={archiveId !== null} onOpenChange={() => setArchiveId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Project</AlertDialogTitle>
            <AlertDialogDescription>
              This will archive the project. You can restore it later from the archive.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => archiveId && handleArchive(archiveId)}>
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProjectsPage;
