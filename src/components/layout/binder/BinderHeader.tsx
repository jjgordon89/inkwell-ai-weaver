
import React from 'react';
import { Search, Filter, Plus, FolderPlus, FileText, Download, Upload, Layers } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BinderHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  onTemplateClick: () => void;
  onAddDocument: () => void;
  onAddFolder: () => void;
  onImportClick: () => void;
  onExportClick: () => void;
}

const BinderHeader = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onTemplateClick,
  onAddDocument,
  onAddFolder,
  onImportClick,
  onExportClick
}: BinderHeaderProps) => {
  return (
    <div className="p-4 border-b bg-muted/30 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Binder</h2>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={onAddDocument}>
                <FileText className="h-4 w-4 mr-2" />
                Add Document
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onAddFolder}>
                <FolderPlus className="h-4 w-4 mr-2" />
                Add Folder
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onTemplateClick}>
                <Layers className="h-4 w-4 mr-2" />
                Templates
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onImportClick}>
                <Upload className="h-4 w-4 mr-2" />
                Import
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onExportClick}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-32">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="not-started">Not Started</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="revised">Revised</SelectItem>
            <SelectItem value="final">Final</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default BinderHeader;
