
import React from 'react';
import { MapPin, Building, Lightbulb } from 'lucide-react';
import WorldElementItem from './WorldElementItem';
import WorldElementForm from './WorldElementForm';
import type { WorldElement } from '@/contexts/WritingContext';

interface WorldElementsListProps {
  groupedElements: {
    location: WorldElement[];
    organization: WorldElement[];
    concept: WorldElement[];
  };
  editingId: string | null;
  formData: {
    name: string;
    type: WorldElement['type'];
    description: string;
  };
  onFormDataChange: (data: { name: string; type: WorldElement['type']; description: string }) => void;
  onEdit: (element: WorldElement) => void;
  onSaveEdit: () => void;
  onDelete: (id: string) => void;
  onCancel: () => void;
}

const WorldElementsList: React.FC<WorldElementsListProps> = ({
  groupedElements,
  editingId,
  formData,
  onFormDataChange,
  onEdit,
  onSaveEdit,
  onDelete,
  onCancel
}) => {
  const getIcon = (type: WorldElement['type']) => {
    switch (type) {
      case 'location':
        return <MapPin className="h-4 w-4" />;
      case 'organization':
        return <Building className="h-4 w-4" />;
      case 'concept':
        return <Lightbulb className="h-4 w-4" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: WorldElement['type']) => {
    switch (type) {
      case 'location':
        return 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950';
      case 'organization':
        return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950';
      case 'concept':
        return 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-950';
      default:
        return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-950';
    }
  };

  const hasElements = Object.values(groupedElements).some(elements => elements.length > 0);

  if (!hasElements) {
    return (
      <div className="text-center text-muted-foreground py-12">
        <p className="text-lg mb-2">No world elements yet</p>
        <p>Start building your world by adding locations, organizations, and concepts.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedElements).map(([type, elements]) => (
        elements.length > 0 && (
          <div key={type}>
            <h3 className="text-lg font-semibold mb-3 capitalize flex items-center gap-2">
              {getIcon(type as WorldElement['type'])}
              {type}s ({elements.length})
            </h3>
            <div className="grid gap-3">
              {elements.map((element) => (
                <div key={element.id}>
                  {editingId === element.id ? (
                    <WorldElementForm
                      formData={formData}
                      isEditing={true}
                      onFormDataChange={onFormDataChange}
                      onSubmit={onSaveEdit}
                      onCancel={onCancel}
                    />
                  ) : (
                    <WorldElementItem
                      element={element}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      getTypeColor={getTypeColor}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      ))}
    </div>
  );
};

export default WorldElementsList;
