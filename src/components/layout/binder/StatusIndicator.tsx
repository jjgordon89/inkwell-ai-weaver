
import React from 'react';
import { Badge } from "@/components/ui/badge";
import type { DocumentNode } from '@/types/document';

interface StatusIndicatorProps {
  status: DocumentNode['status'];
  size?: 'sm' | 'default';
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status, size = 'sm' }) => {
  const getStatusColor = (status: DocumentNode['status']) => {
    switch (status) {
      case 'not-started':
        return 'bg-gray-100 text-gray-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Badge 
      variant="secondary" 
      className={`${getStatusColor(status)} text-xs ${size === 'sm' ? 'px-1 py-0' : ''}`}
    >
      {status.replace('-', ' ')}
    </Badge>
  );
};

export default StatusIndicator;
