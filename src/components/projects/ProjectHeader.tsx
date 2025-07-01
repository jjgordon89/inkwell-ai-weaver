import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface ProjectHeaderProps {
  title: string;
  description?: string;
  onCreateNew?: () => void;
}

const ProjectHeader: React.FC<ProjectHeaderProps> = ({
  title,
  description,
  onCreateNew,
}) => {
  const navigate = useNavigate();

  const handleCreateNew = () => {
    if (onCreateNew) {
      onCreateNew();
    } else {
      navigate("/projects/new");
    }
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      <Button
        onClick={handleCreateNew}
        className="shrink-0"
        data-testid="create-new-project-button"
      >
        <Plus className="mr-2 h-4 w-4" />
        Create New Project
      </Button>
    </div>
  );
};

export default ProjectHeader;
