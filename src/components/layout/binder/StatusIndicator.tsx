import React from 'react';

interface StatusIndicatorProps {
  status?: string;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'final': return 'bg-green-500';
      case 'revised': return 'bg-blue-500';
      case 'first-draft': return 'bg-yellow-500';
      case 'draft': return 'bg-orange-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
  );
};

export default StatusIndicator;