import React from "react";
import { Search, Filter, SortAsc, SortDesc } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuRadioGroup, 
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";

export type ProjectSortField = 
  | "lastModified" 
  | "createdAt" 
  | "name" 
  | "wordCount";

export type ProjectSortOrder = "asc" | "desc";

export type ProjectStatusFilter = "all" | "active" | "archived" | "draft" | "revision" | "editing" | "complete";

export type ProjectTemplateFilter = "all" | "custom" | string;

interface ProjectFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: ProjectStatusFilter;
  onStatusFilterChange: (status: ProjectStatusFilter) => void;
  sortField: ProjectSortField;
  sortOrder: ProjectSortOrder;
  onSortChange: (field: ProjectSortField, order: ProjectSortOrder) => void;
  templateFilter: ProjectTemplateFilter;
  onTemplateFilterChange: (template: ProjectTemplateFilter) => void;
  availableTemplates: string[];
  className?: string;
}

const ProjectFilters: React.FC<ProjectFiltersProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortField,
  sortOrder,
  onSortChange,
  templateFilter,
  onTemplateFilterChange,
  availableTemplates,
  className,
}) => {
  return (
    <div className={`flex flex-col gap-3 md:flex-row md:items-center md:justify-between ${className ?? ""}`}>
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 pr-4 w-full"
          aria-label="Search projects"
          data-testid="project-search-input"
        />
      </div>
      
      <div className="flex items-center flex-wrap gap-2">
        <Select 
          value={statusFilter} 
          onValueChange={(value) => onStatusFilterChange(value as ProjectStatusFilter)}
        >
          <SelectTrigger className="w-[140px] h-9" aria-label="Filter by status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="revision">Revision</SelectItem>
            <SelectItem value="editing">Editing</SelectItem>
            <SelectItem value="complete">Complete</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        
        {availableTemplates.length > 0 && (
          <Select 
            value={templateFilter} 
            onValueChange={(value) => onTemplateFilterChange(value as ProjectTemplateFilter)}
          >
            <SelectTrigger className="w-[140px] h-9" aria-label="Filter by template">
              <SelectValue placeholder="Template" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Templates</SelectItem>
              <SelectItem value="custom">No Template</SelectItem>
              {availableTemplates.map((template) => (
                <SelectItem key={template} value={template}>
                  {template}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-9 gap-1 px-3" aria-label="Sort options">
              {sortOrder === "desc" ? <SortDesc className="h-4 w-4" /> : <SortAsc className="h-4 w-4" />}
              <span>Sort</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Sort by</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup 
              value={sortField} 
              onValueChange={(value) => onSortChange(value as ProjectSortField, sortOrder)}
            >
              <DropdownMenuRadioItem value="lastModified">Last Modified</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="createdAt">Date Created</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="name">Name</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="wordCount">Word Count</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Order</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup 
              value={sortOrder} 
              onValueChange={(value) => onSortChange(sortField, value as ProjectSortOrder)}
            >
              <DropdownMenuRadioItem value="desc">Descending</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="asc">Ascending</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default ProjectFilters;
