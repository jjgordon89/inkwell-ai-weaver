import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import EmptyState from "@/components/ui/empty-state";
import { Plus, Book } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useProject } from "@/contexts/ProjectContext";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { sanitizeString } from "@/utils/stringUtils";
import ExportDialog from "@/components/dialogs/ExportDialog";
import ImportDialog from "@/components/dialogs/ImportDialog";

const PROJECTS_PER_PAGE = 9;

const ProjectsPage = () => {
  const { state, dispatch } = useProject();
  const { projects, searchQuery, filterStatus } = state;
  const [sortBy, setSortBy] = React.useState<string>("lastModified");
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [archiveId, setArchiveId] = React.useState<string | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [exportOpen, setExportOpen] = React.useState(false);
  const [importOpen, setImportOpen] = React.useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Search, filter, sort logic
  const filteredProjects = React.useMemo(() => {
    let list = [...projects];
    if (searchQuery) {
      list = list.filter(p => sanitizeString(p.name).toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (filterStatus && filterStatus !== "all") {
      list = list.filter(p => p.status === filterStatus);
    }
    if (sortBy === "lastModified") {
      list.sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());
    } else if (sortBy === "createdAt") {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === "name") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }
    return list;
  }, [projects, searchQuery, filterStatus, sortBy]);

  const totalPages = Math.ceil(filteredProjects.length / PROJECTS_PER_PAGE);
  const paginatedProjects = React.useMemo(() => {
    const start = (currentPage - 1) * PROJECTS_PER_PAGE;
    return filteredProjects.slice(start, start + PROJECTS_PER_PAGE);
  }, [filteredProjects, currentPage]);

  React.useEffect(() => {
    // Reset to first page if filter/search changes and current page is out of range
    if (currentPage > totalPages) setCurrentPage(1);
  }, [filteredProjects, totalPages, currentPage]);

  // Handlers
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: "SET_SEARCH_QUERY", payload: e.target.value });
  };
  const handleFilter = (value: string) => {
    dispatch({ type: "SET_FILTER_STATUS", payload: value });
  };
  const handleSort = (value: string) => setSortBy(value);

  const handleDelete = (id: string) => {
    dispatch({ type: "DELETE_PROJECT", payload: id });
    setDeleteId(null);
    toast({ title: "Project deleted", description: "The project was deleted successfully." });
  };
  const handleArchive = (id: string) => {
    dispatch({ type: "UPDATE_PROJECT", payload: { id, updates: { status: "archived" } } });
    setArchiveId(null);
    toast({ title: "Project archived", description: "The project was archived." });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto p-8">
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">My Projects</h1>
          <div className="flex gap-2">
            <Button onClick={() => setImportOpen(true)} variant="outline">Import</Button>
            <Button onClick={() => setExportOpen(true)} variant="outline">Export</Button>
            <Button onClick={() => navigate("/projects/new")}>
              <Plus className="mr-2 h-4 w-4" />
              Create New Project
            </Button>
          </div>
        </header>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Input placeholder="Search projects..." value={searchQuery} onChange={handleSearch} className="md:w-1/3" aria-label="Search projects" />
          <Select value={filterStatus} onValueChange={handleFilter}>
            <SelectTrigger className="md:w-40" aria-label="Filter by status">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="revision">Revision</SelectItem>
              <SelectItem value="editing">Editing</SelectItem>
              <SelectItem value="complete">Complete</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
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
            </SelectContent>
          </Select>
        </div>
        <main>
          {paginatedProjects.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedProjects.map((project) => (
                  <Card key={project.id} className="hover:shadow-lg transition-shadow duration-200 cursor-pointer h-full flex flex-col group">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <Book className="text-primary" />
                        {sanitizeString(project.name)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <div className="mb-2 text-sm text-muted-foreground">
                        <div>Created: {format(new Date(project.createdAt), "PPpp")}</div>
                        <div>Last Modified: {format(new Date(project.lastModified), "PPpp")}</div>
                        <div>Status: {project.status}</div>
                        {project.description && <div className="mt-1">{sanitizeString(project.description)}</div>}
                      </div>
                      <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="sm" variant="outline" onClick={() => setArchiveId(project.id)} aria-label="Archive project">Archive</Button>
                        <Button size="sm" variant="destructive" onClick={() => setDeleteId(project.id)} aria-label="Delete project">Delete</Button>
                      </div>
                    </CardContent>
                    <AlertDialog open={deleteId === project.id} onOpenChange={open => !open && setDeleteId(null)}>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Project</AlertDialogTitle>
                          <AlertDialogDescription>Are you sure you want to delete this project? This action cannot be undone.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(project.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <AlertDialog open={archiveId === project.id} onOpenChange={open => !open && setArchiveId(null)}>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Archive Project</AlertDialogTitle>
                          <AlertDialogDescription>Are you sure you want to archive this project? You can restore it later.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleArchive(project.id)}>Archive</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </Card>
                ))}
              </div>
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8 gap-2">
                  <Button size="sm" variant="outline" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} aria-label="Previous page">Prev</Button>
                  {[...Array(totalPages)].map((_, i) => (
                    <Button
                      key={i + 1}
                      size="sm"
                      variant={currentPage === i + 1 ? "default" : "outline"}
                      onClick={() => setCurrentPage(i + 1)}
                      aria-label={`Go to page ${i + 1}`}
                    >
                      {i + 1}
                    </Button>
                  ))}
                  <Button size="sm" variant="outline" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} aria-label="Next page">Next</Button>
                </div>
              )}
            </>
          ) : (
            <EmptyState
              icon={Book}
              title="No Projects Yet"
              description="Get started by creating your first manuscript."
              action={{ label: "Create New Project", onClick: () => navigate("/projects/new") }}
            />
          )}
        </main>
        <ExportDialog open={exportOpen} onOpenChange={setExportOpen} />
        <ImportDialog open={importOpen} onOpenChange={setImportOpen} />
      </div>
    </div>
  );
};

export default ProjectsPage;
