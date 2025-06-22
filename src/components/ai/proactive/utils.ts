
export const generateContinuityNotes = (
  content: string,
  characters: Array<{ name: string }>,
  storyArcs: Array<{ title: string }>,
  worldElements: Array<{ name: string; type: string }>
): string[] => {
  const notes: string[] = [];
  
  // Check for character mentions
  characters.forEach(character => {
    if (content.toLowerCase().includes(character.name.toLowerCase())) {
      notes.push(`${character.name} appears in this section`);
    }
  });

  // Check for story arc progression
  storyArcs.forEach(arc => {
    if (content.toLowerCase().includes(arc.title.toLowerCase())) {
      notes.push(`Story arc "${arc.title}" progresses here`);
    }
  });

  // Check for world elements
  worldElements.forEach(element => {
    if (content.toLowerCase().includes(element.name.toLowerCase())) {
      notes.push(`References ${element.type} "${element.name}"`);
    }
  });

  return notes;
};
