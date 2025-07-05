/**
 * Document Structure Generator
 * 
 * This utility generates appropriate document structures based on template types.
 * Each template type (novel, screenplay, research, poetry) has a different default structure.
 */

import { DocumentNode } from '@/types/document';
import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a default document structure based on project type
 */
export function generateDocumentStructure(
  structure: 'novel' | 'screenplay' | 'research' | 'poetry' | 'academic' | 'memoir' | 'nonfiction',
  options?: {
    chapterCount?: number;
    scenesPerChapter?: number;
    actCount?: number;
    poemCount?: number;
    researchSections?: number;
    academicSections?: number;
    memoirChapters?: number;
    nonfictionSections?: number;
  }
): DocumentNode[] {
  // Get current date/time
  const now = new Date().toISOString();
  
  // Set defaults for options
  const {
    chapterCount = 10,
    scenesPerChapter = 3,
    actCount = 3,
    poemCount = 10,
    researchSections = 5,
    academicSections = 6,
    memoirChapters = 8,
    nonfictionSections = 7
  } = options || {};
  
  // Generate based on structure type
  switch (structure) {
    case 'novel':
      return generateNovelStructure(chapterCount, scenesPerChapter, now);
    case 'screenplay':
      return generateScreenplayStructure(actCount, now);
    case 'research':
      return generateResearchStructure(researchSections, now);
    case 'poetry':
      return generatePoetryStructure(poemCount, now);
    case 'academic':
      return generateAcademicStructure(academicSections, now);
    case 'memoir':
      return generateMemoirStructure(memoirChapters, now);
    case 'nonfiction':
      return generateNonfictionStructure(nonfictionSections, now);
    default:
      return generateBasicStructure(now);
  }
}

/**
 * Generate a novel structure with chapters and scenes
 */
function generateNovelStructure(chapterCount: number, scenesPerChapter: number, timestamp: string): DocumentNode[] {
  // Create root nodes
  const root: DocumentNode[] = [
    {
      id: `template-${uuidv4()}`,
      title: 'Front Matter',
      type: 'folder',
      children: [
        {
          id: `template-${uuidv4()}`,
          title: 'Title Page',
          type: 'document',
          content: '# [Your Novel Title]\n\nBy [Author Name]',
          status: 'draft',
          wordCount: 0,
          labels: ['front-matter'],
          createdAt: timestamp,
          lastModified: timestamp,
          position: 0
        },
        {
          id: `template-${uuidv4()}`,
          title: 'Synopsis',
          type: 'document',
          content: '# Synopsis\n\nWrite a brief overview of your novel here.',
          status: 'not-started',
          wordCount: 0,
          labels: ['front-matter'],
          createdAt: timestamp,
          lastModified: timestamp,
          position: 1
        }
      ],
      status: 'not-started',
      wordCount: 0,
      labels: ['structure'],
      createdAt: timestamp,
      lastModified: timestamp,
      position: 0
    },
    {
      id: `template-${uuidv4()}`,
      title: 'Manuscript',
      type: 'folder',
      children: [],
      status: 'not-started',
      wordCount: 0,
      labels: ['structure'],
      createdAt: timestamp,
      lastModified: timestamp,
      position: 1
    },
    {
      id: `template-${uuidv4()}`,
      title: 'Characters',
      type: 'folder',
      children: [
        {
          id: `template-${uuidv4()}`,
          title: 'Character Template',
          type: 'character-sheet',
          content: '# [Character Name]\n\n## Basic Information\n\n* **Full Name:** \n* **Age:** \n* **Occupation:** \n* **Physical Description:** \n\n## Background\n\n## Personality\n\n## Goals\n\n## Conflicts',
          status: 'not-started',
          wordCount: 0,
          labels: ['character'],
          createdAt: timestamp,
          lastModified: timestamp,
          position: 0
        }
      ],
      status: 'not-started',
      wordCount: 0,
      labels: ['structure'],
      createdAt: timestamp,
      lastModified: timestamp,
      position: 2
    },
    {
      id: `template-${uuidv4()}`,
      title: 'Settings',
      type: 'folder',
      children: [
        {
          id: `template-${uuidv4()}`,
          title: 'Setting Template',
          type: 'setting-description',
          content: '# [Setting Name]\n\n## Description\n\n## Significance\n\n## Details',
          status: 'not-started',
          wordCount: 0,
          labels: ['setting'],
          createdAt: timestamp,
          lastModified: timestamp,
          position: 0
        }
      ],
      status: 'not-started',
      wordCount: 0,
      labels: ['structure'],
      createdAt: timestamp,
      lastModified: timestamp,
      position: 3
    },
    {
      id: `template-${uuidv4()}`,
      title: 'Notes',
      type: 'folder',
      children: [
        {
          id: `template-${uuidv4()}`,
          title: 'Research Notes',
          type: 'research-note',
          content: '# Research Notes\n\nAdd your research findings here.',
          status: 'not-started',
          wordCount: 0,
          labels: ['note'],
          createdAt: timestamp,
          lastModified: timestamp,
          position: 0
        }
      ],
      status: 'not-started',
      wordCount: 0,
      labels: ['structure'],
      createdAt: timestamp,
      lastModified: timestamp,
      position: 4
    }
  ];
  
  // Add chapters to manuscript
  const manuscript = root[1].children = [];
  
  for (let i = 0; i < chapterCount; i++) {
    const chapterId = `template-${uuidv4()}`;
    const chapterNumber = i + 1;
    
    const chapter: DocumentNode = {
      id: chapterId,
      title: `Chapter ${chapterNumber}`,
      type: 'chapter',
      parentId: root[1].id,
      children: [],
      synopsis: `Brief description of Chapter ${chapterNumber}`,
      status: 'not-started',
      wordCount: 0,
      labels: ['chapter'],
      createdAt: timestamp,
      lastModified: timestamp,
      position: i
    };
    
    // Add scenes to chapter
    for (let j = 0; j < scenesPerChapter; j++) {
      const sceneNumber = j + 1;
      
      chapter.children!.push({
        id: `template-${uuidv4()}`,
        title: `Scene ${chapterNumber}.${sceneNumber}`,
        type: 'scene',
        parentId: chapterId,
        content: '',
        synopsis: `Brief description of Scene ${sceneNumber} in Chapter ${chapterNumber}`,
        status: 'not-started',
        wordCount: 0,
        labels: ['scene'],
        createdAt: timestamp,
        lastModified: timestamp,
        position: j,
        metadata: {
          POV: '',
          setting: '',
          characters: []
        }
      });
    }
    
    manuscript.push(chapter);
  }
  
  return root;
}

/**
 * Generate a screenplay structure with acts and scenes
 */
function generateScreenplayStructure(actCount: number, timestamp: string): DocumentNode[] {
  // Create root nodes
  const root: DocumentNode[] = [
    {
      id: `template-${uuidv4()}`,
      title: 'Title Page',
      type: 'document',
      content: '# [Your Screenplay Title]\n\nBy [Author Name]\n\nContact Information:\n[Your Name]\n[Your Email]\n[Your Phone]',
      status: 'draft',
      wordCount: 0,
      labels: ['front-matter'],
      createdAt: timestamp,
      lastModified: timestamp,
      position: 0
    },
    {
      id: `template-${uuidv4()}`,
      title: 'Synopsis',
      type: 'document',
      content: '# Synopsis\n\nWrite a brief overview of your screenplay here (1-2 paragraphs).',
      status: 'not-started',
      wordCount: 0,
      labels: ['front-matter'],
      createdAt: timestamp,
      lastModified: timestamp,
      position: 1
    },
    {
      id: `template-${uuidv4()}`,
      title: 'Treatment',
      type: 'document',
      content: '# Treatment\n\nWrite a more detailed synopsis here (3-5 pages), describing the major plot points and character arcs.',
      status: 'not-started',
      wordCount: 0,
      labels: ['front-matter'],
      createdAt: timestamp,
      lastModified: timestamp,
      position: 2
    },
    {
      id: `template-${uuidv4()}`,
      title: 'Screenplay',
      type: 'folder',
      children: [],
      status: 'not-started',
      wordCount: 0,
      labels: ['structure'],
      createdAt: timestamp,
      lastModified: timestamp,
      position: 3
    },
    {
      id: `template-${uuidv4()}`,
      title: 'Characters',
      type: 'folder',
      children: [
        {
          id: `template-${uuidv4()}`,
          title: 'Character Template',
          type: 'character-sheet',
          content: '# [Character Name]\n\n## Basic Information\n\n* **Age:** \n* **Occupation:** \n* **Physical Description:** \n\n## Character Arc\n\n## Motivation\n\n## Conflicts',
          status: 'not-started',
          wordCount: 0,
          labels: ['character'],
          createdAt: timestamp,
          lastModified: timestamp,
          position: 0
        }
      ],
      status: 'not-started',
      wordCount: 0,
      labels: ['structure'],
      createdAt: timestamp,
      lastModified: timestamp,
      position: 4
    },
    {
      id: `template-${uuidv4()}`,
      title: 'Notes',
      type: 'folder',
      children: [],
      status: 'not-started',
      wordCount: 0,
      labels: ['structure'],
      createdAt: timestamp,
      lastModified: timestamp,
      position: 5
    }
  ];
  
  // Add acts to screenplay
  const screenplay = root[3].children = [];
  
  for (let i = 0; i < actCount; i++) {
    const actId = `template-${uuidv4()}`;
    const actNumber = i + 1;
    const scenes = i === 0 ? 10 : (i === actCount - 1 ? 15 : 25); // Different scene counts per act
    
    const act: DocumentNode = {
      id: actId,
      title: `Act ${actNumber}`,
      type: 'act',
      parentId: root[3].id,
      children: [],
      synopsis: actNumber === 1 
        ? 'Setup - Introduce the characters and the world' 
        : (actNumber === actCount ? 'Resolution - Climax and conclusion' : 'Confrontation - Rising conflicts and complications'),
      status: 'not-started',
      wordCount: 0,
      labels: ['act'],
      createdAt: timestamp,
      lastModified: timestamp,
      position: i
    };
    
    // Add scenes to act
    for (let j = 0; j < scenes; j++) {
      const sceneNumber = j + 1;
      
      act.children!.push({
        id: `template-${uuidv4()}`,
        title: `Scene ${sceneNumber}`,
        type: 'screenplay-scene',
        parentId: actId,
        content: '',
        synopsis: `Scene ${sceneNumber} of Act ${actNumber}`,
        status: 'not-started',
        wordCount: 0,
        labels: ['scene'],
        createdAt: timestamp,
        lastModified: timestamp,
        position: j,
        metadata: {
          setting: '',
          characters: []
        }
      });
    }
    
    screenplay.push(act);
  }
  
  // Add a notes section
  root[5].children = [
    {
      id: `template-${uuidv4()}`,
      title: 'Research Notes',
      type: 'research-note',
      content: '# Research Notes\n\nAdd research relevant to your screenplay here.',
      status: 'not-started',
      wordCount: 0,
      labels: ['note'],
      createdAt: timestamp,
      lastModified: timestamp,
      position: 0
    },
    {
      id: `template-${uuidv4()}`,
      title: 'Industry Notes',
      type: 'research-note',
      content: '# Industry Notes\n\nAdd notes about production considerations, budget, and other industry factors here.',
      status: 'not-started',
      wordCount: 0,
      labels: ['note'],
      createdAt: timestamp,
      lastModified: timestamp,
      position: 1
    }
  ];
  
  return root;
}

/**
 * Generate a research structure with sections
 */
function generateResearchStructure(sectionCount: number, timestamp: string): DocumentNode[] {
  // Create root nodes
  const root: DocumentNode[] = [
    {
      id: `template-${uuidv4()}`,
      title: 'Title Page',
      type: 'document',
      content: '# [Your Research Title]\n\nBy [Author Name]\n\n[Institution/Organization]\n\n[Date]',
      status: 'draft',
      wordCount: 0,
      labels: ['front-matter'],
      createdAt: timestamp,
      lastModified: timestamp,
      position: 0
    },
    {
      id: `template-${uuidv4()}`,
      title: 'Abstract',
      type: 'document',
      content: '# Abstract\n\nProvide a brief summary of your research, including your objectives, methods, results, and conclusions (150-250 words).',
      status: 'not-started',
      wordCount: 0,
      labels: ['front-matter'],
      createdAt: timestamp,
      lastModified: timestamp,
      position: 1
    },
    {
      id: `template-${uuidv4()}`,
      title: 'Introduction',
      type: 'document',
      content: '# Introduction\n\n## Background\n\n## Research Question\n\n## Significance',
      status: 'not-started',
      wordCount: 0,
      labels: ['section'],
      createdAt: timestamp,
      lastModified: timestamp,
      position: 2
    },
    {
      id: `template-${uuidv4()}`,
      title: 'Literature Review',
      type: 'document',
      content: '# Literature Review\n\nSummarize and analyze relevant previous research and establish the theoretical framework for your study.',
      status: 'not-started',
      wordCount: 0,
      labels: ['section'],
      createdAt: timestamp,
      lastModified: timestamp,
      position: 3
    },
    {
      id: `template-${uuidv4()}`,
      title: 'Methodology',
      type: 'document',
      content: '# Methodology\n\n## Research Design\n\n## Data Collection\n\n## Analysis Methods',
      status: 'not-started',
      wordCount: 0,
      labels: ['section'],
      createdAt: timestamp,
      lastModified: timestamp,
      position: 4
    },
    {
      id: `template-${uuidv4()}`,
      title: 'Results',
      type: 'document',
      content: '# Results\n\nPresent your findings without interpretation.',
      status: 'not-started',
      wordCount: 0,
      labels: ['section'],
      createdAt: timestamp,
      lastModified: timestamp,
      position: 5
    },
    {
      id: `template-${uuidv4()}`,
      title: 'Discussion',
      type: 'document',
      content: '# Discussion\n\n## Interpretation of Results\n\n## Limitations\n\n## Implications',
      status: 'not-started',
      wordCount: 0,
      labels: ['section'],
      createdAt: timestamp,
      lastModified: timestamp,
      position: 6
    },
    {
      id: `template-${uuidv4()}`,
      title: 'Conclusion',
      type: 'document',
      content: '# Conclusion\n\nSummarize your findings and their importance.',
      status: 'not-started',
      wordCount: 0,
      labels: ['section'],
      createdAt: timestamp,
      lastModified: timestamp,
      position: 7
    },
    {
      id: `template-${uuidv4()}`,
      title: 'References',
      type: 'document',
      content: '# References\n\nList all sources cited in your research.',
      status: 'not-started',
      wordCount: 0,
      labels: ['back-matter'],
      createdAt: timestamp,
      lastModified: timestamp,
      position: 8
    },
    {
      id: `template-${uuidv4()}`,
      title: 'Appendices',
      type: 'folder',
      children: [],
      status: 'not-started',
      wordCount: 0,
      labels: ['back-matter'],
      createdAt: timestamp,
      lastModified: timestamp,
      position: 9
    },
    {
      id: `template-${uuidv4()}`,
      title: 'Research Notes',
      type: 'folder',
      children: [],
      status: 'not-started',
      wordCount: 0,
      labels: ['notes'],
      createdAt: timestamp,
      lastModified: timestamp,
      position: 10
    }
  ];
  
  // Add appendices
  const appendices = root[9].children = [];
  
  for (let i = 0; i < 3; i++) {
    appendices.push({
      id: `template-${uuidv4()}`,
      title: `Appendix ${String.fromCharCode(65 + i)}`,
      type: 'document',
      parentId: root[9].id,
      content: `# Appendix ${String.fromCharCode(65 + i)}\n\nSupplementary information.`,
      status: 'not-started',
      wordCount: 0,
      labels: ['appendix'],
      createdAt: timestamp,
      lastModified: timestamp,
      position: i
    });
  }
  
  // Add research notes
  const notes = root[10].children = [];
  
  for (let i = 0; i < sectionCount; i++) {
    notes.push({
      id: `template-${uuidv4()}`,
      title: `Research Note ${i + 1}`,
      type: 'research-note',
      parentId: root[10].id,
      content: `# Research Note ${i + 1}\n\nAdd notes, observations, and data here.`,
      status: 'not-started',
      wordCount: 0,
      labels: ['note'],
      createdAt: timestamp,
      lastModified: timestamp,
      position: i
    });
  }
  
  return root;
}

/**
 * Generate a poetry structure with poems
 */
function generatePoetryStructure(poemCount: number, timestamp: string): DocumentNode[] {
  // Create root nodes
  const root: DocumentNode[] = [
    {
      id: `template-${uuidv4()}`,
      title: 'Collection Title',
      type: 'document',
      content: '# [Your Collection Title]\n\nBy [Author Name]\n\n[Year]',
      status: 'draft',
      wordCount: 0,
      labels: ['front-matter'],
      createdAt: timestamp,
      lastModified: timestamp,
      position: 0
    },
    {
      id: `template-${uuidv4()}`,
      title: 'Preface',
      type: 'document',
      content: '# Preface\n\nIntroduce your poetry collection and its themes.',
      status: 'not-started',
      wordCount: 0,
      labels: ['front-matter'],
      createdAt: timestamp,
      lastModified: timestamp,
      position: 1
    },
    {
      id: `template-${uuidv4()}`,
      title: 'Poems',
      type: 'folder',
      children: [],
      status: 'not-started',
      wordCount: 0,
      labels: ['structure'],
      createdAt: timestamp,
      lastModified: timestamp,
      position: 2
    },
    {
      id: `template-${uuidv4()}`,
      title: 'Notes',
      type: 'folder',
      children: [
        {
          id: `template-${uuidv4()}`,
          title: 'Poetry Forms',
          type: 'research-note',
          content: '# Poetry Forms\n\n## Sonnet\nA 14-line poem with a specific rhyme scheme.\n\n## Haiku\nA three-line poem with 5-7-5 syllable pattern.\n\n## Free Verse\nPoetry without regular meter or rhyme scheme.\n\n## Villanelle\nA 19-line poem with two repeating rhymes and two refrains.',
          status: 'not-started',
          wordCount: 0,
          labels: ['note'],
          createdAt: timestamp,
          lastModified: timestamp,
          position: 0
        },
        {
          id: `template-${uuidv4()}`,
          title: 'Inspiration',
          type: 'research-note',
          content: '# Inspiration\n\nRecord sources of inspiration for your poems here.',
          status: 'not-started',
          wordCount: 0,
          labels: ['note'],
          createdAt: timestamp,
          lastModified: timestamp,
          position: 1
        }
      ],
      status: 'not-started',
      wordCount: 0,
      labels: ['structure'],
      createdAt: timestamp,
      lastModified: timestamp,
      position: 3
    }
  ];
  
  // Add poems
  const poems = root[2].children = [];
  
  for (let i = 0; i < poemCount; i++) {
    poems.push({
      id: `template-${uuidv4()}`,
      title: `Poem ${i + 1}`,
      type: 'poem',
      parentId: root[2].id,
      content: '',
      synopsis: `Brief description of Poem ${i + 1}`,
      status: 'not-started',
      wordCount: 0,
      labels: ['poem'],
      createdAt: timestamp,
      lastModified: timestamp,
      position: i,
      metadata: {
        form: '',
        themes: []
      }
    });
  }
  
  return root;
}

/**
 * Generate a basic document structure
 */
function generateBasicStructure(timestamp: string): DocumentNode[] {
  return [
    {
      id: `template-${uuidv4()}`,
      title: 'Document',
      type: 'document',
      content: '# Untitled Document\n\nStart writing here...',
      status: 'not-started',
      wordCount: 0,
      labels: ['document'],
      createdAt: timestamp,
      lastModified: timestamp,
      position: 0
    },
    {
      id: `template-${uuidv4()}`,
      title: 'Notes',
      type: 'folder',
      children: [
        {
          id: `template-${uuidv4()}`,
          title: 'Note 1',
          type: 'document',
          content: '# Note 1\n\nAdd notes here.',
          status: 'not-started',
          wordCount: 0,
          labels: ['note'],
          createdAt: timestamp,
          lastModified: timestamp,
          position: 0
        }
      ],
      status: 'not-started',
      wordCount: 0,
      labels: ['structure'],
      createdAt: timestamp,
      lastModified: timestamp,
      position: 1
    }
  ];
}

/**
 * Generate an academic structure with sections and subsections
 */
function generateAcademicStructure(sectionCount: number, timestamp: string): DocumentNode[] {
  // Create root nodes
  const root: DocumentNode[] = [
    {
      id: `template-${uuidv4()}`,
      title: 'Front Matter',
      type: 'folder',
      children: [
        {
          id: `template-${uuidv4()}`,
          title: 'Title Page',
          type: 'document',
          content: '# [Your Academic Title]\n\nBy [Author Name]\n\n[Institution]\n\n[Date]',
          status: 'draft',
          wordCount: 0,
          labels: ['front-matter'],
          createdAt: timestamp,
          lastModified: timestamp,
          position: 0
        },
        {
          id: `template-${uuidv4()}`,
          title: 'Abstract',
          type: 'document',
          content: '# Abstract\n\nWrite a brief overview of your academic work here (150-250 words).',
          status: 'not-started',
          wordCount: 0,
          labels: ['front-matter'],
          createdAt: timestamp,
          lastModified: timestamp,
          position: 1
        },
        {
          id: `template-${uuidv4()}`,
          title: 'Keywords',
          type: 'document',
          content: '# Keywords\n\nList 5-7 keywords that represent the main concepts in your work.',
          status: 'not-started',
          wordCount: 0,
          labels: ['front-matter'],
          createdAt: timestamp,
          lastModified: timestamp,
          position: 2
        }
      ],
      status: 'not-started',
      wordCount: 0,
      labels: ['structure'],
      createdAt: timestamp,
      lastModified: timestamp,
      position: 0
    },
    {
      id: `template-${uuidv4()}`,
      title: 'Introduction',
      type: 'document',
      content: '# Introduction\n\nIntroduce your topic, provide background, state your research question, and outline the significance of your study.',
      status: 'not-started',
      wordCount: 0,
      labels: ['academic'],
      createdAt: timestamp,
      lastModified: timestamp,
      position: 1
    },
    {
      id: `template-${uuidv4()}`,
      title: 'Literature Review',
      type: 'document',
      content: '# Literature Review\n\nDiscuss existing research and theoretical frameworks relevant to your study.',
      status: 'not-started',
      wordCount: 0,
      labels: ['academic'],
      createdAt: timestamp,
      lastModified: timestamp,
      position: 2
    },
    {
      id: `template-${uuidv4()}`,
      title: 'Methodology',
      type: 'document',
      content: '# Methodology\n\nDescribe your research design, methods, participants, materials, and procedures.',
      status: 'not-started',
      wordCount: 0,
      labels: ['academic'],
      createdAt: timestamp,
      lastModified: timestamp,
      position: 3
    },
    {
      id: `template-${uuidv4()}`,
      title: 'Main Sections',
      type: 'folder',
      children: [],
      status: 'not-started',
      wordCount: 0,
      labels: ['structure'],
      createdAt: timestamp,
      lastModified: timestamp,
      position: 4
    },
    {
      id: `template-${uuidv4()}`,
      title: 'Discussion',
      type: 'document',
      content: '# Discussion\n\nInterpret your findings, discuss implications, limitations, and suggestions for future research.',
      status: 'not-started',
      wordCount: 0,
      labels: ['academic'],
      createdAt: timestamp,
      lastModified: timestamp,
      position: 5
    },
    {
      id: `template-${uuidv4()}`,
      title: 'Conclusion',
      type: 'document',
      content: '# Conclusion\n\nSummarize your main points and findings.',
      status: 'not-started',
      wordCount: 0,
      labels: ['academic'],
      createdAt: timestamp,
      lastModified: timestamp,
      position: 6
    },
    {
      id: `template-${uuidv4()}`,
      title: 'References',
      type: 'document',
      content: '# References\n\nList all sources cited in your document following the appropriate citation style.',
      status: 'not-started',
      wordCount: 0,
      labels: ['references'],
      createdAt: timestamp,
      lastModified: timestamp,
      position: 7
    },
    {
      id: `template-${uuidv4()}`,
      title: 'Appendices',
      type: 'folder',
      children: [],
      status: 'not-started',
      wordCount: 0,
      labels: ['structure'],
      createdAt: timestamp,
      lastModified: timestamp,
      position: 8
    }
  ];

  // Add academic sections
  const sections = [];
  for (let i = 0; i < sectionCount; i++) {
    sections.push({
      id: `template-${uuidv4()}`,
      title: `Section ${i + 1}`,
      type: 'document',
      parentId: root[4].id,
      content: `# Section ${i + 1}\n\nAdd your content for this section here.`,
      status: 'not-started',
      wordCount: 0,
      labels: ['academic'],
      createdAt: timestamp,
      lastModified: timestamp,
      position: i
    });
  }

  // Assign children to the appropriate parent
  if (root[4].children) {
    root[4].children = sections;
  }

  return root;
}

/**
 * Generate a memoir structure with chapters and timeline elements
 */
function generateMemoirStructure(chapterCount: number, timestamp: string): DocumentNode[] {
  // Create root nodes
  const root: DocumentNode[] = [
    {
      id: `template-${uuidv4()}`,
      title: 'Front Matter',
      type: 'folder',
      children: [
        {
          id: `template-${uuidv4()}`,
          title: 'Title Page',
          type: 'document',
          content: '# [Your Memoir Title]\n\nBy [Author Name]',
          status: 'draft',
          wordCount: 0,
          labels: ['front-matter'],
          createdAt: timestamp,
          lastModified: timestamp,
          position: 0
        },
        {
          id: `template-${uuidv4()}`,
          title: 'Dedication',
          type: 'document',
          content: '# Dedication\n\nFor [person or people]',
          status: 'not-started',
          wordCount: 0,
          labels: ['front-matter'],
          createdAt: timestamp,
          lastModified: timestamp,
          position: 1
        },
        {
          id: `template-${uuidv4()}`,
          title: 'Preface',
          type: 'document',
          content: '# Preface\n\nExplain why you decided to write this memoir and what readers can expect.',
          status: 'not-started',
          wordCount: 0,
          labels: ['front-matter'],
          createdAt: timestamp,
          lastModified: timestamp,
          position: 2
        }
      ],
      status: 'not-started',
      wordCount: 0,
      labels: ['structure'],
      createdAt: timestamp,
      lastModified: timestamp,
      position: 0
    },
    {
      id: `template-${uuidv4()}`,
      title: 'Chapters',
      type: 'folder',
      children: [],
      status: 'not-started',
      wordCount: 0,
      labels: ['structure'],
      createdAt: timestamp,
      lastModified: timestamp,
      position: 1
    },
    {
      id: `template-${uuidv4()}`,
      title: 'Timeline',
      type: 'folder',
      children: [
        {
          id: `template-${uuidv4()}`,
          title: 'Key Events',
          type: 'document',
          content: '# Key Events Timeline\n\nList major life events and their dates here.',
          status: 'not-started',
          wordCount: 0,
          labels: ['timeline'],
          createdAt: timestamp,
          lastModified: timestamp,
          position: 0
        }
      ],
      status: 'not-started',
      wordCount: 0,
      labels: ['structure'],
      createdAt: timestamp,
      lastModified: timestamp,
      position: 2
    },
    {
      id: `template-${uuidv4()}`,
      title: 'People',
      type: 'folder',
      children: [
        {
          id: `template-${uuidv4()}`,
          title: 'Person Template',
          type: 'document',
          content: '# [Person Name]\n\n## Relationship\n\n## Significance\n\n## Memories',
          status: 'not-started',
          wordCount: 0,
          labels: ['people'],
          createdAt: timestamp,
          lastModified: timestamp,
          position: 0
        }
      ],
      status: 'not-started',
      wordCount: 0,
      labels: ['structure'],
      createdAt: timestamp,
      lastModified: timestamp,
      position: 3
    },
    {
      id: `template-${uuidv4()}`,
      title: 'Photos & Memorabilia',
      type: 'folder',
      children: [
        {
          id: `template-${uuidv4()}`,
          title: 'Photo Descriptions',
          type: 'document',
          content: '# Photo Descriptions\n\nList and describe important photos you want to include in your memoir.',
          status: 'not-started',
          wordCount: 0,
          labels: ['photos'],
          createdAt: timestamp,
          lastModified: timestamp,
          position: 0
        }
      ],
      status: 'not-started',
      wordCount: 0,
      labels: ['structure'],
      createdAt: timestamp,
      lastModified: timestamp,
      position: 4
    },
    {
      id: `template-${uuidv4()}`,
      title: 'Reflections',
      type: 'document',
      content: '# Reflections\n\nAdd your overall reflections and lessons learned from the experiences shared in your memoir.',
      status: 'not-started',
      wordCount: 0,
      labels: ['reflections'],
      createdAt: timestamp,
      lastModified: timestamp,
      position: 5
    }
  ];

  // Add memoir chapters
  const chapters = [];
  for (let i = 0; i < chapterCount; i++) {
    chapters.push({
      id: `template-${uuidv4()}`,
      title: `Chapter ${i + 1}`,
      type: 'chapter',
      parentId: root[1].id,
      content: `# Chapter ${i + 1}\n\nAdd your memoir content for this chapter here.`,
      status: 'not-started',
      wordCount: 0,
      labels: ['memoir'],
      createdAt: timestamp,
      lastModified: timestamp,
      position: i
    });
  }

  // Assign children to the appropriate parent
  if (root[1].children) {
    root[1].children = chapters;
  }

  return root;
}

/**
 * Generate a nonfiction structure with sections and chapters
 */
function generateNonfictionStructure(sectionCount: number, timestamp: string): DocumentNode[] {
  // Create root nodes
  const root: DocumentNode[] = [
    {
      id: `template-${uuidv4()}`,
      title: 'Front Matter',
      type: 'folder',
      children: [
        {
          id: `template-${uuidv4()}`,
          title: 'Title Page',
          type: 'document',
          content: '# [Your Nonfiction Title]\n\nBy [Author Name]',
          status: 'draft',
          wordCount: 0,
          labels: ['front-matter'],
          createdAt: timestamp,
          lastModified: timestamp,
          position: 0
        },
        {
          id: `template-${uuidv4()}`,
          title: 'Table of Contents',
          type: 'document',
          content: '# Table of Contents\n\n1. [Section 1 Title]\n2. [Section 2 Title]\n3. [Section 3 Title]',
          status: 'not-started',
          wordCount: 0,
          labels: ['front-matter'],
          createdAt: timestamp,
          lastModified: timestamp,
          position: 1
        },
        {
          id: `template-${uuidv4()}`,
          title: 'Introduction',
          type: 'document',
          content: '# Introduction\n\nIntroduce your nonfiction topic, why it matters, and what readers will learn.',
          status: 'not-started',
          wordCount: 0,
          labels: ['front-matter'],
          createdAt: timestamp,
          lastModified: timestamp,
          position: 2
        }
      ],
      status: 'not-started',
      wordCount: 0,
      labels: ['structure'],
      createdAt: timestamp,
      lastModified: timestamp,
      position: 0
    },
    {
      id: `template-${uuidv4()}`,
      title: 'Main Sections',
      type: 'folder',
      children: [],
      status: 'not-started',
      wordCount: 0,
      labels: ['structure'],
      createdAt: timestamp,
      lastModified: timestamp,
      position: 1
    },
    {
      id: `template-${uuidv4()}`,
      title: 'Conclusion',
      type: 'document',
      content: '# Conclusion\n\nSummarize the key points covered in your nonfiction book and their significance.',
      status: 'not-started',
      wordCount: 0,
      labels: ['nonfiction'],
      createdAt: timestamp,
      lastModified: timestamp,
      position: 2
    },
    {
      id: `template-${uuidv4()}`,
      title: 'Back Matter',
      type: 'folder',
      children: [
        {
          id: `template-${uuidv4()}`,
          title: 'References',
          type: 'document',
          content: '# References\n\nList all sources cited in your nonfiction book.',
          status: 'not-started',
          wordCount: 0,
          labels: ['references'],
          createdAt: timestamp,
          lastModified: timestamp,
          position: 0
        },
        {
          id: `template-${uuidv4()}`,
          title: 'Appendices',
          type: 'folder',
          children: [],
          status: 'not-started',
          wordCount: 0,
          labels: ['structure'],
          createdAt: timestamp,
          lastModified: timestamp,
          position: 1
        },
        {
          id: `template-${uuidv4()}`,
          title: 'Glossary',
          type: 'document',
          content: '# Glossary\n\nDefine key terms used in your nonfiction book.',
          status: 'not-started',
          wordCount: 0,
          labels: ['glossary'],
          createdAt: timestamp,
          lastModified: timestamp,
          position: 2
        },
        {
          id: `template-${uuidv4()}`,
          title: 'Index',
          type: 'document',
          content: '# Index\n\nAdd an alphabetical list of topics and their page numbers.',
          status: 'not-started',
          wordCount: 0,
          labels: ['index'],
          createdAt: timestamp,
          lastModified: timestamp,
          position: 3
        }
      ],
      status: 'not-started',
      wordCount: 0,
      labels: ['structure'],
      createdAt: timestamp,
      lastModified: timestamp,
      position: 3
    },
    {
      id: `template-${uuidv4()}`,
      title: 'Research Notes',
      type: 'folder',
      children: [
        {
          id: `template-${uuidv4()}`,
          title: 'Research Template',
          type: 'research-note',
          content: '# Research Note\n\n## Source\n\n## Key Information\n\n## Relevance',
          status: 'not-started',
          wordCount: 0,
          labels: ['research'],
          createdAt: timestamp,
          lastModified: timestamp,
          position: 0
        }
      ],
      status: 'not-started',
      wordCount: 0,
      labels: ['structure'],
      createdAt: timestamp,
      lastModified: timestamp,
      position: 4
    }
  ];

  // Add nonfiction sections
  const sections = [];
  for (let i = 0; i < sectionCount; i++) {
    // Each section will have 2 chapters
    const sectionNode: DocumentNode = {
      id: `template-${uuidv4()}`,
      title: `Section ${i + 1}`,
      type: 'folder',
      parentId: root[1].id,
      children: [
        {
          id: `template-${uuidv4()}`,
          title: `Chapter ${i*2 + 1}`,
          type: 'chapter',
          content: `# Chapter ${i*2 + 1}\n\nAdd your nonfiction content for this chapter here.`,
          status: 'not-started',
          wordCount: 0,
          labels: ['nonfiction'],
          createdAt: timestamp,
          lastModified: timestamp,
          position: 0
        },
        {
          id: `template-${uuidv4()}`,
          title: `Chapter ${i*2 + 2}`,
          type: 'chapter',
          content: `# Chapter ${i*2 + 2}\n\nAdd your nonfiction content for this chapter here.`,
          status: 'not-started',
          wordCount: 0,
          labels: ['nonfiction'],
          createdAt: timestamp,
          lastModified: timestamp,
          position: 1
        }
      ],
      status: 'not-started',
      wordCount: 0,
      labels: ['nonfiction'],
      createdAt: timestamp,
      lastModified: timestamp,
      position: i
    };

    sections.push(sectionNode);
  }

  // Assign children to the appropriate parent
  if (root[1].children) {
    root[1].children = sections;
  }

  return root;
}
