import React from "react";
import { Button } from "@/components/ui/button";
import { FileText, Plus, Search, Filter } from "lucide-react";

interface ProjectEmptyStateProps {
  hasFilters: boolean;
  onCreateNew: () => void;
  onClearFilters?: () => void;
  className?: string;
}

const ProjectEmptyState: React.FC<ProjectEmptyStateProps> = ({
  hasFilters,
  onCreateNew,
  onClearFilters,
  className,
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 ${className ?? ""}`}>
      <div className="rounded-full bg-muted p-4 mb-4">
        {hasFilters ? 
          <Search className="h-12 w-12 text-muted-foreground/50" /> : 
          <FileText className="h-12 w-12 text-muted-foreground/50" />
        }
      </div>
      <h3 className="text-lg font-medium mt-2">
        {hasFilters ? "No matching projects" : "No projects found"}
      </h3>
      <p className="text-muted-foreground text-sm max-w-md mt-1 mb-4">
        {hasFilters
          ? "Try adjusting your search or filters to find what you're looking for"
          : "Get started by creating a new project"}
      </p>
      {hasFilters && onClearFilters ? (
        <Button variant="outline" onClick={onClearFilters}>
          <Filter className="mr-2 h-4 w-4" />
          Clear Filters
        </Button>
      ) : (
        <Button onClick={onCreateNew}>
          <Plus className="mr-2 h-4 w-4" />
          Create New Project
        </Button>
      )}
    </div>
  );
};

export default ProjectEmptyState;
