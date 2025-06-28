
import React from 'react';
import { FileText, Folder, BookOpen, FileEdit } from 'lucide-react';
import type { DocumentNode } from '@/types/document';

interface TypeIconProps {
  type: DocumentNode['type'];
  className?: string;
}

const TypeIcon: React.FC<TypeIconProps> = ({ type, className = "h-4 w-4" }) => {
  switch (type) {
    case 'folder':
      return <Folder className={`${className} text-blue-600`} />;
    case 'chapter':
      return <BookOpen className={`${className} text-green-600`} />;
    case 'scene':
      return <FileEdit className={`${className} text-purple-600`} />;
    case 'document':
    default:
      return <FileText className={`${className} text-gray-600`} />;
  }
};

export default TypeIcon;
