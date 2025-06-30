import { v4 as uuidv4 } from 'uuid';
import { 
  DocumentNode, 
  NewDocument, 
  ContentFormat, 
  DocumentVisibility
} from '@/types/document';
import { normalizeDate } from '@/utils/dateUtils';
import { sanitizeString, sanitizeRichText } from '@/utils/stringUtils';

/**
 * Creates a new document with proper defaults
 * @param document Document partial data
 * @returns Complete document with defaults
 */
export const createDocument = (document: NewDocument): DocumentNode => {
  const now = new Date().toISOString();
  
  // Determine content format to use the appropriate sanitization
  const contentFormat = document.metadata?.contentFormat || ContentFormat.RICH_TEXT;
  
  // Sanitize content based on format
  const sanitizedContent = document.content 
    ? contentFormat === ContentFormat.RICH_TEXT 
      ? sanitizeRichText(document.content) 
      : sanitizeString(document.content)
    : '';
  
  return {
    id: uuidv4(),
    title: sanitizeString(document.title),
    type: document.type,
    parentId: document.parentId,
    children: document.children || [],
    content: sanitizedContent,
    synopsis: document.synopsis ? sanitizeString(document.synopsis) : '',
    status: document.status || 'not-started',
    wordCount: document.wordCount || calculateWordCount(sanitizedContent),
    targetWordCount: document.targetWordCount,
    labels: document.labels || [],
    createdAt: now,
    lastModified: now,
    position: document.position || 0,
    metadata: {
      ...document.metadata,
      contentFormat: contentFormat,
      visibility: document.metadata?.visibility || DocumentVisibility.PRIVATE,
      version: document.metadata?.version || 1,
    }
  };
};

/**
 * Calculates word count for a document content
 * @param content Document content
 * @returns Word count
 */
export const calculateWordCount = (content?: string): number => {
  if (!content) return 0;
  
  // Remove HTML tags if present
  const strippedContent = content.replace(/<[^>]*>/g, ' ');
  
  // Count words (sequences of non-whitespace characters)
  const words = strippedContent.match(/\S+/g);
  return words ? words.length : 0;
};

/**
 * Builds a complete document tree by combining parent-child relationships
 * @param flatDocuments Array of documents without hierarchy
 * @returns Hierarchical document tree
 */
export const buildDocumentTree = (flatDocuments: DocumentNode[]): DocumentNode[] => {
  const documentsById = new Map<string, DocumentNode>();
  const rootDocuments: DocumentNode[] = [];
  
  // First pass: create a map of all documents by ID
  flatDocuments.forEach(doc => {
    documentsById.set(doc.id, { ...doc, children: [] });
  });
  
  // Second pass: build the tree
  documentsById.forEach(doc => {
    if (doc.parentId && documentsById.has(doc.parentId)) {
      const parent = documentsById.get(doc.parentId);
      if (parent && !parent.children) {
        parent.children = [];
      }
      parent?.children?.push(doc);
    } else {
      rootDocuments.push(doc);
    }
  });
  
  // Sort children by position
  const sortByPosition = (documents: DocumentNode[]): DocumentNode[] => {
    return documents.map(doc => {
      if (doc.children && doc.children.length > 0) {
        return { ...doc, children: sortByPosition(doc.children) };
      }
      return doc;
    }).sort((a, b) => a.position - b.position);
  };
  
  return sortByPosition(rootDocuments);
};

/**
 * Flattens a document tree into an array
 * @param tree Hierarchical document tree
 * @returns Flat array of all documents
 */
export const flattenDocumentTree = (tree: DocumentNode[]): DocumentNode[] => {
  const result: DocumentNode[] = [];
  
  const traverse = (nodes: DocumentNode[]) => {
    for (const node of nodes) {
      result.push(node);
      if (node.children && node.children.length > 0) {
        traverse(node.children);
      }
    }
  };
  
  traverse(tree);
  return result;
};

/**
 * Creates a default document structure for a new project
 * @param projectId ID of the project
 * @param projectType Type of project (novel, screenplay, etc.)
 * @returns Default document tree for the project
 */
export const createDefaultDocumentStructure = (
  projectId: string, 
  projectType: 'novel' | 'screenplay' | 'research' | 'poetry' = 'novel'
): DocumentNode[] => {
  const now = new Date().toISOString();
  
  // Create manuscript root folder
  const manuscriptFolder: DocumentNode = {
    id: `${projectId}-manuscript-root`,
    title: 'Manuscript',
    type: 'folder',
    status: 'not-started',
    wordCount: 0,
    labels: ['permanent', 'manuscript'],
    createdAt: now,
    lastModified: now,
    position: 0,
    children: []
  };
  
  // Create research folder
  const researchFolder: DocumentNode = {
    id: uuidv4(),
    title: 'Research',
    type: 'folder',
    status: 'not-started',
    wordCount: 0,
    labels: ['research'],
    createdAt: now,
    lastModified: now,
    position: 1,
    children: []
  };
  
  // Create characters folder
  const charactersFolder: DocumentNode = {
    id: uuidv4(),
    title: 'Characters',
    type: 'folder',
    status: 'not-started',
    wordCount: 0,
    labels: ['characters'],
    createdAt: now,
    lastModified: now,
    position: 2,
    children: []
  };
  
  // Project-specific structure
  switch (projectType) {
    case 'novel':
      manuscriptFolder.children = [
        {
          id: uuidv4(),
          title: 'Chapter 1',
          type: 'chapter',
          parentId: manuscriptFolder.id,
          status: 'not-started',
          wordCount: 0,
          labels: [],
          createdAt: now,
          lastModified: now,
          position: 0,
          children: []
        }
      ];
      break;
      
    case 'screenplay':
      manuscriptFolder.children = [
        {
          id: uuidv4(),
          title: 'Act 1',
          type: 'act',
          parentId: manuscriptFolder.id,
          status: 'not-started',
          wordCount: 0,
          labels: [],
          createdAt: now,
          lastModified: now,
          position: 0,
          children: [
            {
              id: uuidv4(),
              title: 'Scene 1',
              type: 'screenplay-scene',
              parentId: manuscriptFolder.id,
              status: 'not-started',
              wordCount: 0,
              labels: [],
              createdAt: now,
              lastModified: now,
              position: 0,
              children: []
            }
          ]
        }
      ];
      break;
      
    case 'poetry':
      manuscriptFolder.children = [
        {
          id: uuidv4(),
          title: 'Poem 1',
          type: 'poem',
          parentId: manuscriptFolder.id,
          status: 'not-started',
          wordCount: 0,
          labels: [],
          createdAt: now,
          lastModified: now,
          position: 0,
          children: []
        }
      ];
      break;
      
    case 'research':
      researchFolder.children = [
        {
          id: uuidv4(),
          title: 'Research Note 1',
          type: 'research-note',
          parentId: researchFolder.id,
          status: 'not-started',
          wordCount: 0,
          labels: [],
          createdAt: now,
          lastModified: now,
          position: 0,
          children: []
        }
      ];
      break;
  }
  
  return [manuscriptFolder, researchFolder, charactersFolder];
};

/**
 * Gets a document by ID from a document tree
 * @param tree Document tree to search
 * @param id ID of the document to find
 * @returns Found document or undefined
 */
export const getDocumentById = (
  tree: DocumentNode[], 
  id: string
): DocumentNode | undefined => {
  for (const doc of tree) {
    if (doc.id === id) {
      return doc;
    }
    
    if (doc.children && doc.children.length > 0) {
      const found = getDocumentById(doc.children, id);
      if (found) {
        return found;
      }
    }
  }
  
  return undefined;
};

/**
 * Gets the path to a document in the tree
 * @param tree Document tree to search
 * @param id ID of the document to find
 * @returns Array of documents from root to the target document
 */
export const getDocumentPath = (
  tree: DocumentNode[], 
  id: string
): DocumentNode[] => {
  for (const doc of tree) {
    if (doc.id === id) {
      return [doc];
    }
    
    if (doc.children && doc.children.length > 0) {
      const childPath = getDocumentPath(doc.children, id);
      if (childPath.length > 0) {
        return [doc, ...childPath];
      }
    }
  }
  
  return [];
};

/**
 * Calculate total word count for a document tree
 * @param tree Document tree or subtree
 * @returns Total word count
 */
export const calculateTotalWordCount = (tree: DocumentNode[]): number => {
  let total = 0;
  
  for (const doc of tree) {
    total += doc.wordCount;
    
    if (doc.children && doc.children.length > 0) {
      total += calculateTotalWordCount(doc.children);
    }
  }
  
  return total;
};

/**
 * Updates parent folder word counts when a child document changes
 * @param tree Document tree
 * @param changedDocId ID of the document that changed
 * @param oldWordCount Previous word count
 * @param newWordCount New word count
 * @returns Updated document tree
 */
export const updateParentWordCounts = (
  tree: DocumentNode[],
  changedDocId: string,
  oldWordCount: number,
  newWordCount: number
): DocumentNode[] => {
  const difference = newWordCount - oldWordCount;
  if (difference === 0) return tree;
  
  const updateRecursive = (nodes: DocumentNode[]): DocumentNode[] => {
    return nodes.map(node => {
      // If this node has the changed doc as a child, update its word count
      const hasChangedChild = node.children?.some(child => 
        child.id === changedDocId || 
        child.children?.some(grandchild => grandchild.id === changedDocId)
      );
      
      if (hasChangedChild) {
        return {
          ...node,
          wordCount: node.wordCount + difference,
          children: node.children ? updateRecursive(node.children) : undefined
        };
      }
      
      // Otherwise, just update its children recursively
      if (node.children) {
        return {
          ...node,
          children: updateRecursive(node.children)
        };
      }
      
      return node;
    });
  };
  
  return updateRecursive(tree);
};

/**
 * Sanitize document content based on its format
 * @param content Content to sanitize
 * @param format Content format
 * @returns Sanitized content
 */
export const sanitizeDocumentContent = (
  content: string, 
  format: ContentFormat = ContentFormat.RICH_TEXT
): string => {
  if (!content) return '';
  
  switch (format) {
    case ContentFormat.HTML:
    case ContentFormat.RICH_TEXT:
      return sanitizeRichText(content);
      
    case ContentFormat.MARKDOWN:
    case ContentFormat.PLAIN_TEXT:
    default:
      return sanitizeString(content);
  }
};

/**
 * Apply text formatting to a selection range
 * @param content Original content
 * @param range Selection range
 * @param formatting Formatting to apply
 * @param format Content format
 * @returns Formatted content
 */
export const applyFormatting = (
  content: string, 
  range: {
    startOffset: number;
    endOffset: number;
    selectedText: string;
  },
  formatting: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    link?: string;
    code?: boolean;
  },
  format: ContentFormat = ContentFormat.RICH_TEXT
): string => {
  if (!content || !range) return content;
  
  const { startOffset, endOffset, selectedText } = range;
  const before = content.substring(0, startOffset);
  const after = content.substring(endOffset);
  
  let formattedText = selectedText;
  
  switch (format) {
    case ContentFormat.MARKDOWN:
      if (formatting.bold) formattedText = `**${formattedText}**`;
      if (formatting.italic) formattedText = `*${formattedText}*`;
      if (formatting.code) formattedText = `\`${formattedText}\``;
      if (formatting.link && formatting.link.trim() !== '') {
        formattedText = `[${formattedText}](${formatting.link})`;
      }
      break;
      
    case ContentFormat.HTML:
    case ContentFormat.RICH_TEXT: {
      let openTags = '';
      let closeTags = '';
      
      if (formatting.bold) {
        openTags += '<strong>';
        closeTags = '</strong>' + closeTags;
      }
      if (formatting.italic) {
        openTags += '<em>';
        closeTags = '</em>' + closeTags;
      }
      if (formatting.underline) {
        openTags += '<u>';
        closeTags = '</u>' + closeTags;
      }
      if (formatting.code) {
        openTags += '<code>';
        closeTags = '</code>' + closeTags;
      }
      if (formatting.link && formatting.link.trim() !== '') {
        openTags += `<a href="${formatting.link}">`;
        closeTags = '</a>' + closeTags;
      }
      
      formattedText = openTags + formattedText + closeTags;
      break;
    }
      break;
      
    default:
      // Plain text - no formatting applied
      break;
  }
  
  return before + formattedText + after;
};

/**
 * Create a content snapshot for document versioning
 * @param document Document to snapshot
 * @param description Optional description
 * @param changeType Type of change
 * @returns Content snapshot object
 */
export const createContentSnapshot = (
  document: DocumentNode,
  description?: string,
  changeType: 'auto-save' | 'manual-save' | 'milestone' | 'pre-ai-edit' | 'recovery' = 'manual-save'
) => {
  return {
    id: uuidv4(),
    documentId: document.id,
    timestamp: new Date().toISOString(),
    content: document.content || '',
    wordCount: document.wordCount,
    version: (document.metadata?.version || 1) + 1,
    description,
    changeType
  };
};

/**
 * Merge two documents together
 * @param sourceDoc Source document
 * @param targetDoc Target document
 * @param mergeStrategy How to merge the content
 * @returns Merged document
 */
export const mergeDocuments = (
  sourceDoc: DocumentNode,
  targetDoc: DocumentNode,
  mergeStrategy: 'append' | 'prepend' | 'replace' = 'append'
): DocumentNode => {
  const sourceContent = sourceDoc.content || '';
  const targetContent = targetDoc.content || '';
  let mergedContent = '';
  
  switch (mergeStrategy) {
    case 'append':
      mergedContent = targetContent + '\n\n' + sourceContent;
      break;
    case 'prepend':
      mergedContent = sourceContent + '\n\n' + targetContent;
      break;
    case 'replace':
      mergedContent = sourceContent;
      break;
  }
  
  const newWordCount = calculateWordCount(mergedContent);
  
  return {
    ...targetDoc,
    content: mergedContent,
    wordCount: newWordCount,
    lastModified: new Date().toISOString(),
    metadata: {
      ...targetDoc.metadata,
      version: (targetDoc.metadata?.version || 1) + 1
    }
  };
};

/**
 * Split a document into two at the specified position
 * @param document Document to split
 * @param splitPoint Character position to split at
 * @param newDocumentTitle Title for the new document
 * @returns Array containing the original and new document
 */
export const splitDocument = (
  document: DocumentNode,
  splitPoint: number,
  newDocumentTitle: string
): [DocumentNode, DocumentNode] => {
  if (!document.content) {
    return [document, createDocument({
      title: newDocumentTitle,
      type: document.type,
      parentId: document.parentId,
      position: document.position + 1,
      status: 'not-started',
      labels: []
    })];
  }
  
  const firstPart = document.content.substring(0, splitPoint);
  const secondPart = document.content.substring(splitPoint);
  
  const firstDocWordCount = calculateWordCount(firstPart);
  const secondDocWordCount = calculateWordCount(secondPart);
  
  const updatedOriginal: DocumentNode = {
    ...document,
    content: firstPart,
    wordCount: firstDocWordCount,
    lastModified: new Date().toISOString()
  };
  
  const newDocument = createDocument({
    title: sanitizeString(newDocumentTitle),
    type: document.type,
    parentId: document.parentId,
    content: secondPart,
    wordCount: secondDocWordCount,
    position: document.position + 1,
    status: document.status,
    labels: [...document.labels]
  });
  
  return [updatedOriginal, newDocument];
};

/**
 * Duplicate a document
 * @param document Document to duplicate
 * @param newTitle Optional new title
 * @param newParentId Optional new parent ID
 * @returns Duplicated document
 */
export const duplicateDocument = (
  document: DocumentNode,
  newTitle?: string,
  newParentId?: string
): DocumentNode => {
  const title = newTitle || `${document.title} (Copy)`;
  
  return createDocument({
    title: sanitizeString(title),
    type: document.type,
    parentId: newParentId || document.parentId,
    content: document.content,
    synopsis: document.synopsis,
    status: document.status,
    wordCount: document.wordCount,
    targetWordCount: document.targetWordCount,
    labels: [...document.labels],
    position: document.position + 1,
    metadata: { ...document.metadata }
  });
};
