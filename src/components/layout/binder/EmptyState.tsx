import React from 'react';
import { FileText } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  searchQuery: string;
  statusFilter: string;
  onClearFilters: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = React.memo(({
  searchQuery,
  statusFilter,
  onClearFilters
}) => {
  return (
    <div className="text-center text-muted-foreground py-8">
      <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
      <p className="text-sm">No documents found</p>
      {(searchQuery || statusFilter !== 'all') && (
        <Button 
          variant="link" 
          size="sm" 
          onClick={onClearFilters}
          className="mt-2"
        >
          Clear filters
        </Button>
      )}
    </div>
  );
});

EmptyState.displayName = 'EmptyState';