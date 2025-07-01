import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ProjectConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}

export const ProjectConfirmDialog: React.FC<ProjectConfirmDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  title = "Confirm Action",
  description = "Are you sure you want to proceed with this action?",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={destructive ? "bg-destructive hover:bg-destructive/90" : ""}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

interface ProjectConfirmDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  projectName: string;
}

export const ProjectConfirmDeleteDialog: React.FC<ProjectConfirmDeleteDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  projectName,
}) => {
  return (
    <ProjectConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      title="Delete Project"
      description={`Are you sure you want to delete "${projectName}"? This action cannot be undone.`}
      confirmLabel="Delete"
      cancelLabel="Cancel"
      destructive={true}
    />
  );
};

interface ProjectConfirmArchiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  projectName: string;
  isArchiving: boolean;
}

export const ProjectConfirmArchiveDialog: React.FC<ProjectConfirmArchiveDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  projectName,
  isArchiving,
}) => {
  return (
    <ProjectConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      title={isArchiving ? "Archive Project" : "Unarchive Project"}
      description={
        isArchiving
          ? `Are you sure you want to archive "${projectName}"? It will be moved to the archived section.`
          : `Are you sure you want to unarchive "${projectName}"? It will be moved back to active projects.`
      }
      confirmLabel={isArchiving ? "Archive" : "Unarchive"}
      cancelLabel="Cancel"
      destructive={false}
    />
  );
};
