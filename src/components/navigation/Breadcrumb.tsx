
import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { useWriting } from '@/contexts/WritingContext';

const Breadcrumb = () => {
  const { state } = useWriting();

  const getSectionDisplayName = (section: string) => {
    const sectionMap: Record<string, string> = {
      'story': 'Story',
      'outline': 'Outline',
      'story-structure': 'Story Structure',
      'characters': 'Characters',
      'story-arc': 'Story Arc',
      'world-building': 'World Building',
      'cross-references': 'Cross-References',
      'ai-assistance': 'AI Assistance',
    };
    return sectionMap[section] || section;
  };

  const getSectionCategory = (section: string) => {
    const aiSections = ['ai-assistance'];
    return aiSections.includes(section) ? 'AI & ML' : 'Writing';
  };

  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
      <Home className="h-4 w-4" />
      <ChevronRight className="h-4 w-4" />
      <span className="text-muted-foreground">{getSectionCategory(state.activeSection)}</span>
      <ChevronRight className="h-4 w-4" />
      <span className="font-medium text-foreground">{getSectionDisplayName(state.activeSection)}</span>
    </nav>
  );
};

export default Breadcrumb;
