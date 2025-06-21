import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import EmptyState from "@/components/ui/empty-state";
import { Plus, Book } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const ProjectsPage = () => {
  // Mock data for projects. In a real app, this would come from an API.
  const projects = [
    { id: 1, name: "The Crimson Cipher", lastEdited: "2 hours ago" },
    { id: 2, name: "Echoes of Nebula", lastEdited: "1 day ago" },
  ];

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto p-8">
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">My Projects</h1>
          <Button onClick={() => navigate("/projects/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Create New Project
          </Button>
        </header>

        <main>
          {projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Link to="/" key={project.id}>
                  <Card className="hover:shadow-lg transition-shadow duration-200 cursor-pointer h-full flex flex-col">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <Book className="text-primary"/>
                        {project.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-sm text-muted-foreground">Last edited: {project.lastEdited}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Book}
              title="No Projects Yet"
              description="Get started by creating your first manuscript."
              action={{
                label: "Create New Project",
                onClick: () => navigate("/projects/new"),
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default ProjectsPage;
