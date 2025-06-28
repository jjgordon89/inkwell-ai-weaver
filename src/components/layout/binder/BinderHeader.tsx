
import React from 'react';
import { Search, Plus, FileText, Upload, Download, Folder } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

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
    <div className="p-4 border-b bg-muted/30">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold">Binder</h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onAddFolder}>
              <Folder className="h-4 w-4 mr-2" />
              New Folder
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onTemplateClick}>
              <FileText className="h-4 w-4 mr-2" />
              New from Template
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onAddDocument}>
              <FileText className="h-4 w-4 mr-2" />
              New Document
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onImportClick}>
              <Upload className="h-4 w-4 mr-2" />
              Import Document
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onExportClick}>
              <Download className="h-4 w-4 mr-2" />
              Export Project
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Search */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-8"
          />
        </div>
        
        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="h-8">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="not-started">Not Started</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="first-draft">First Draft</SelectItem>
            <SelectItem value="revised">Revised</SelectItem>
            <SelectItem value="final">Final</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default BinderHeader;
