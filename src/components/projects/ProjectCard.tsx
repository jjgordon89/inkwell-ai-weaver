import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { FileEdit, MoreVertical, Trash, Archive, BookOpen } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ProjectConfirmDeleteDialog } from "./ProjectConfirmDialog";

interface ProjectCardProps {
  id: string;
  title: string;
  description?: string;
  status: "active" | "archived" | "draft";
  wordCount: number;
  lastModified: Date;
  createdAt: Date;
  template?: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  className?: string;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  id,
  title,
  description,
  status,
  wordCount,
  lastModified,
  createdAt,
  template,
  onEdit,
  onDelete,
  onArchive,
  className,
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  
  // Status badge color
  const statusColor = React.useMemo(() => {
    switch (status) {
      case "active": return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
      case "archived": return "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20";
      case "draft": return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20";
      default: return "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20";
    }
  }, [status]);

  return (
    <>
      <Card className={cn("overflow-hidden h-full flex flex-col transition-all hover:shadow-md", className)}>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <Badge className={cn("mb-2", statusColor)}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(id)}>
                  <FileEdit className="mr-2 h-4 w-4" />
                  Edit Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onArchive(id)}>
                  <Archive className="mr-2 h-4 w-4" />
                  {status === "archived" ? "Unarchive" : "Archive"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <CardTitle className="text-xl line-clamp-1" title={title}>
            {title}
          </CardTitle>
          {description && (
            <div className="text-muted-foreground line-clamp-2 text-sm mt-1" title={description}>
              {description}
            </div>
          )}
        </CardHeader>
        <CardContent className="pb-0 flex-grow">
          <div className="grid grid-cols-2 gap-2 text-sm mt-2">
            <div>
              <div className="text-muted-foreground">Words</div>
              <div>{wordCount.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Template</div>
              <div className="truncate" title={template || "Custom"}>
                {template || "Custom"}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Created</div>
              <div title={format(createdAt, "PPP")}>
                {format(createdAt, "MMM d, yyyy")}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Modified</div>
              <div title={format(lastModified, "PPP p")}>
                {format(lastModified, "MMM d, yyyy")}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-4 pb-4">
          <Link 
            to={`/studio/${id}`} 
            className="w-full"
            aria-label={`Open ${title}`}
          >
            <Button variant="default" className="w-full">
              <BookOpen className="mr-2 h-4 w-4" />
              Open Project
            </Button>
          </Link>
        </CardFooter>
      </Card>

      <ProjectConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={() => {
          onDelete(id);
          setDeleteDialogOpen(false);
        }}
        projectName={title}
      />
    </>
  );
};

export default ProjectCard;
