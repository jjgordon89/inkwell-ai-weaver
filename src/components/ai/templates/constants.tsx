
import { 
  FileText, 
  User, 
  Map, 
  BookOpen
} from 'lucide-react';
import type { Template } from './types';

export const TEMPLATES: Template[] = [
  {
    id: 'story-outline',
    title: 'Story Outline',
    type: 'outline',
    description: 'Generate a comprehensive story structure with plot points',
    icon: <BookOpen className="h-4 w-4" />
  },
  {
    id: 'character-profile',
    title: 'Character Profile',
    type: 'character',
    description: 'Create detailed character backgrounds and personalities',
    icon: <User className="h-4 w-4" />
  },
  {
    id: 'scene-structure',
    title: 'Scene Structure',
    type: 'scene',
    description: 'Build engaging scenes with conflict and resolution',
    icon: <Map className="h-4 w-4" />
  },
  {
    id: 'world-building',
    title: 'World Building',
    type: 'world',
    description: 'Develop rich settings and environments',
    icon: <FileText className="h-4 w-4" />
  }
];
