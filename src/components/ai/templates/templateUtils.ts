
import type { Template } from './types';

export const generateTemplatePrompt = (template: Template, content: string): string => {
  const baseContent = content?.substring(0, 500) || 'New story';
  
  switch (template.type) {
    case 'outline':
      return `Generate a detailed story outline with:
- Three-act structure
- Key plot points
- Character arcs
- Conflict progression
Based on the current content: "${baseContent}"`;
    
    case 'character':
      return `Create a comprehensive character profile including:
- Background and history
- Personality traits
- Motivations and goals
- Relationships
- Character arc
Based on story context: "${content?.substring(0, 300) || 'New character'}"`;
    
    case 'scene':
      return `Design a scene structure with:
- Setting and atmosphere
- Character goals and obstacles
- Conflict and tension
- Resolution or cliffhanger
Based on story: "${content?.substring(0, 300) || 'New scene'}"`;
    
    case 'world':
      return `Develop world building elements:
- Setting description
- Cultural elements
- Rules and systems
- Historical background
Based on story world: "${content?.substring(0, 300) || 'New world'}"`;
    
    default:
      return `Generate ${template.title} content based on: "${baseContent}"`;
  }
};

export const formatTemplateContent = (template: Template, content: string): string => {
  return `\n\n--- ${template.title} ---\n${content}`;
};
