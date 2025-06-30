export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string | Date;
  lastModified: string | Date;
  structure: 'novel' | 'screenplay' | 'research' | 'poetry';
  wordCountTarget?: number;
  status: 'active' | 'draft' | 'revision' | 'editing' | 'complete' | 'archived';
  lastAccessedAt?: string | Date;
  owner?: string;
  collaborators?: string[];
  template?: string; // Template ID if created from a template
  settings?: {
    autoSaveInterval?: number;
    defaultContentFormat?: ContentFormat;
    defaultDocumentType?: string;
    enableAiAssistance?: boolean;
    aiProviders?: string[];
    customFields?: Record<string, unknown>;
  };
}

export interface DocumentNode {
  id: string;
  title: string;
  type: 'folder' | 'document' | 'chapter' | 'scene' | 'character-sheet' | 'research-note' | 
        'timeline-event' | 'setting-description' | 'plot-point' | 'dialogue' | 'poem' | 
        'stanza' | 'screenplay-scene' | 'act' | 'sequence';
  parentId?: string;
  children?: DocumentNode[];
  content?: string;
  synopsis?: string;
  status: 'not-started' | 'draft' | 'first-draft' | 'revised' | 'final' | 'in-progress' | 'needs-review' | 'approved' | 'on-hold';
  wordCount: number;
  targetWordCount?: number;
  labels: string[];
  createdAt: string | Date;
  lastModified: string | Date;
  position: number;
  metadata?: {
    POV?: string;
    setting?: string;
    characters?: string[];
    keywords?: string[];
    notes?: string;
    eventDate?: string | Date;
    importance?: 'low' | 'medium' | 'high';
    contentFormat?: ContentFormat;
    visibility?: DocumentVisibility;
    aiAssisted?: boolean;
    version?: number;
    customFields?: Record<string, unknown>;
    accessibility?: {
      altText?: string;
      ariaLabel?: string;
      readingLevel?: 'elementary' | 'middle' | 'high-school' | 'college' | 'academic';
      textToSpeechMarkers?: Record<string, string>;
    };
    revisions?: DocumentRevision[];
    commentCount?: number;
    readerStats?: {
      viewCount: number;
      averageTimeSpent: number; // in seconds
      completionRate: number; // percentage
    };
  };
}

export interface DocumentView {
  id: string;
  name: string;
  type: 'editor' | 'corkboard' | 'outline' | 'timeline' | 'research';
  activeDocumentId?: string;
  /**
   * Use unknown to avoid explicit any. Cast to the expected type when reading/writing settings.
   */
  viewSettings?: Record<string, unknown>;
}

/**
 * Analytics data for tracking writing progress and habits
 */
export interface AnalyticsData {
  /**
   * Daily word counts indexed by date strings (ISO format)
   */
  dailyWordCounts: Record<string, number>;
  
  /**
   * Time spent writing in seconds indexed by date strings (ISO format)
   */
  writingTime: Record<string, number>;
  
  /**
   * Writing session data
   */
  sessions: WritingSession[];
  
  /**
   * Overall statistics
   */
  stats: {
    totalWordCount: number;
    averageWordsPerDay: number;
    averageWordsPerSession: number;
    averageSessionDuration: number;
    daysWritten: number;
    totalSessions: number;
    mostProductiveTimeOfDay?: string;
    mostProductiveDayOfWeek?: string;
    streakData?: {
      currentStreak: number;
      longestStreak: number;
      lastWritingDate: string;
    };
    goalAchievement?: {
      dailyGoals: {
        achieved: number;
        total: number;
        percentage: number;
      };
      weeklyGoals: {
        achieved: number;
        total: number;
        percentage: number;
      };
    };
    revision: {
      revisionsCount: number;
      averageRevisionTime: number;
      wordsAddedDuringRevision: number;
      wordsRemovedDuringRevision: number;
    };
    aiContributions?: {
      totalSuggestions: number;
      acceptedSuggestions: number;
      acceptanceRate: number;
      wordCountFromAI: number;
      percentageOfTotalContent: number;
    };
  };
  
  /**
   * Historical progress data for visualization
   */
  progressHistory: {
    wordCountByWeek: Record<string, number>;
    timeSpentByWeek: Record<string, number>;
    completionPercentageByWeek: Record<string, number>;
  };
}

/**
 * Data for a single writing session
 */
export interface WritingSession {
  id: string;
  projectId: string;
  documentIds: string[];
  startTime: string | Date;
  endTime: string | Date;
  duration: number; // in seconds
  wordCount: number;
  wordsPerMinute: number;
  keystrokes: number;
  deletions: number;
  pauseDuration: number; // total time spent paused during session in seconds
  focusScore: number; // 0-100 score based on frequency of context switching
  environment?: {
    deviceType: 'desktop' | 'mobile' | 'tablet' | 'other';
    location?: string;
    noiseLevel?: 'quiet' | 'moderate' | 'noisy';
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  };
  milestones?: {
    goalsMet: string[];
    wordCountThresholds: number[];
    achievements: string[];
  };
  mood?: 'focused' | 'distracted' | 'inspired' | 'struggling' | 'productive' | 'tired';
  notes?: string;
}

/**
 * Enum for document content formats
 */
export enum ContentFormat {
  PLAIN_TEXT = 'plain_text',
  MARKDOWN = 'markdown',
  RICH_TEXT = 'rich_text',
  HTML = 'html'
}

/**
 * Enum for document visibility settings
 */
export enum DocumentVisibility {
  PRIVATE = 'private',
  SHARED = 'shared',
  PUBLIC = 'public'
}

/**
 * Extended document metadata for enhanced features
 */
export interface ExtendedDocumentMetadata {
  contentFormat: ContentFormat;
  visibility: DocumentVisibility;
  collaborators?: string[];
  version: number;
  revisionHistory?: DocumentRevision[];
  aiAssisted: boolean;
  aiContributions?: AiContribution[];
  tags: string[];
  customFields?: Record<string, unknown>;
}

/**
 * Document revision history entry
 */
export interface DocumentRevision {
  id: string;
  timestamp: string | Date;
  userId: string;
  userName: string;
  changeDescription: string;
  wordCountDelta: number;
}

/**
 * AI contribution to a document
 */
export interface AiContribution {
  id: string;
  timestamp: string | Date;
  type: 'suggestion' | 'completion' | 'rewrite' | 'analysis' | 'research' | 'editing' | 'brainstorming' | 'title-generation' | 'summary';
  prompt: string;
  content: string;
  accepted: boolean;
  modelId: string;
  metadata: {
    wordCount: number;
    tokenCount?: number;
    processingTime?: number; // in milliseconds
    confidenceScore?: number; // 0-1 value indicating AI confidence
    context?: {
      documentContext: string;
      promptTokens: number;
      responseTokens: number;
    };
    userFeedback?: {
      rating?: 1 | 2 | 3 | 4 | 5;
      feedbackText?: string;
      usefulnessScore?: number;
      creativityScore?: number;
      accuracyScore?: number;
    };
    sourceReferences?: Array<{
      title: string;
      url?: string;
      author?: string;
      retrievalScore?: number;
      citation?: string;
    }>;
    revisionCount?: number; // how many times this was revised before acceptance
  };
  position?: {
    startOffset: number;
    endOffset: number;
    replacedText?: string;
  };
}

/**
 * Type for creating a new document
 */
export type NewDocument = Omit<DocumentNode, 'id' | 'createdAt' | 'lastModified' | 'wordCount'> & {
  wordCount?: number;
};

/**
 * Type for updating an existing document
 */
export type UpdateDocumentPayload = {
  id: string;
  updates: Partial<Omit<DocumentNode, 'id' | 'createdAt'>>;
};

/**
 * Type for document tree operations
 */
export type DocumentTreeOperation = 
  | { type: 'add'; document: NewDocument; parentId?: string }
  | { type: 'update'; id: string; updates: Partial<DocumentNode> }
  | { type: 'delete'; id: string }
  | { type: 'move'; id: string; newParentId?: string; newPosition: number }
  | { type: 'reorder'; parentId?: string; orderedChildIds: string[] }
  | { type: 'duplicate'; id: string; newParentId?: string; newPosition?: number; newTitle?: string }
  | { type: 'batchMove'; ids: string[]; newParentId?: string; startPosition?: number }
  | { type: 'merge'; sourceId: string; targetId: string; mergeStrategy: 'append' | 'prepend' | 'replace' }
  | { type: 'split'; id: string; splitPoint: number; newDocumentTitle: string }
  | { type: 'importBranch'; parentId?: string; position?: number; nodes: DocumentNode[] };

/**
 * Project template definition
 */
export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  structure: 'novel' | 'screenplay' | 'research' | 'poetry';
  initialDocumentTree: DocumentNode[];
  metadata?: {
    authorName?: string;
    authorEmail?: string;
    tags?: string[];
    previewImage?: string;
    category?: string;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    estimatedTime?: string;
  };
}

/**
 * Project backup/export format
 */
export interface ProjectExport {
  version: string;
  exportDate: string;
  project: Project;
  documents: DocumentNode[];
  analytics?: AnalyticsData;
}

/**
 * Editor engagement metrics for tracking user interactions
 */
export interface EditorEngagement {
  userId?: string;
  projectId: string;
  documentId: string;
  session: string; // session ID
  metrics: {
    timeInEditor: number; // seconds
    clickCount: number;
    keyPressCount: number;
    scrollEvents: number;
    contextMenuOpens: number;
    toolbarInteractions: number;
    aiRequestCount: number;
    copyPasteActions: number;
    undoRedoActions: number;
    savedVersionCount: number;
    featureUsage: Record<string, number>; // tracks use of specific features
  };
  timestamps: {
    firstInteraction: string;
    lastInteraction: string;
    totalSessions: number;
  };
  appVersion: string;
  platform: string;
}

/**
 * Configuration for accessibility settings
 */
export interface AccessibilityConfig {
  highContrast: boolean;
  fontSize: number;
  fontFamily: string;
  lineSpacing: number;
  dyslexicFont: boolean;
  screenReaderOptimized: boolean;
  reduceAnimations: boolean;
  keyboardNavigationEnhanced: boolean;
  colorBlindMode?: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia';
  customCss?: string;
}

/**
 * Document auto-save state
 */
export interface AutoSaveState {
  documentId: string;
  lastSaved: string;
  pendingChanges: boolean;
  errorState?: {
    hasError: boolean;
    errorMessage?: string;
    lastSuccessfulSave?: string;
    retryCount: number;
  };
  draftContent?: string;
  localVersion?: number;
  syncState: 'synced' | 'local-ahead' | 'remote-ahead' | 'conflict';
}

/**
 * Document content snapshot for versioning and recovery
 */
export interface ContentSnapshot {
  id: string;
  documentId: string;
  timestamp: string | Date;
  content: string;
  wordCount: number;
  version: number;
  createdBy?: string;
  description?: string;
  changeType: 'auto-save' | 'manual-save' | 'milestone' | 'pre-ai-edit' | 'recovery';
  metadata?: {
    sessionId?: string;
    deviceInfo?: string;
    relatedAiContributionId?: string;
    tags?: string[];
  };
}

/**
 * Document comparison result for diff views
 */
export interface DocumentComparison {
  documentId: string;
  baseVersionId: string;
  compareVersionId: string;
  baseTimestamp: string | Date;
  compareTimestamp: string | Date;
  wordCountDelta: number;
  additions: Array<{
    content: string;
    startPosition: number;
    endPosition: number;
  }>;
  deletions: Array<{
    content: string;
    startPosition: number;
    endPosition: number;
  }>;
  changes: Array<{
    oldContent: string;
    newContent: string;
    startPosition: number;
    endPosition: number;
  }>;
  summary?: string;
}

/**
 * Writing goal configuration
 */
export interface WritingGoal {
  id: string;
  projectId: string;
  documentId?: string;
  type: 'word-count' | 'writing-time' | 'completion-date' | 'custom';
  target: number;
  unit: 'words' | 'minutes' | 'hours' | 'days' | 'chapters' | 'scenes' | 'custom';
  frequency: 'daily' | 'weekly' | 'monthly' | 'project' | 'custom';
  startDate?: string | Date;
  endDate?: string | Date;
  progress: number;
  progressPercentage: number;
  streak?: number;
  history?: Array<{
    date: string | Date;
    value: number;
    achieved: boolean;
  }>;
  reminderEnabled?: boolean;
  reminderTime?: string;
  customGoalMetric?: string;
}

/**
 * Export configuration for different document formats
 */
export interface ExportConfig {
  format: 'markdown' | 'html' | 'pdf' | 'docx' | 'epub' | 'txt' | 'rtf' | 'latex';
  includeFrontMatter: boolean;
  includeMetadata: boolean;
  tableOfContents: boolean;
  pageNumbers: boolean;
  chapterBreaks: boolean;
  fontFamily?: string;
  fontSize?: number;
  lineSpacing?: number;
  margins?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  headerText?: string;
  footerText?: string;
  coverImage?: string;
  styleTemplate?: string;
  documentTitle?: string;
  authorName?: string;
  customCss?: string;
  documentFilter?: (doc: DocumentNode) => boolean;
}

/**
 * Publishing platform configuration
 */
export interface PublishingPlatform {
  id: string;
  name: string;
  type: 'blog' | 'ebook' | 'social-media' | 'traditional' | 'self-publishing' | 'custom';
  apiKey?: string;
  authToken?: string;
  refreshToken?: string;
  endpoint?: string;
  username?: string;
  accountId?: string;
  defaultFormat: string;
  lastSync?: string | Date;
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  metadata?: Record<string, unknown>;
}

/**
 * Document publishing status
 */
export interface PublishingStatus {
  documentId: string;
  platformId: string;
  status: 'draft' | 'pending' | 'published' | 'updated' | 'error' | 'unpublished';
  publishedUrl?: string;
  publishedDate?: string | Date;
  lastUpdated?: string | Date;
  error?: string;
  revisions: number;
  analytics?: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
  };
}

/**
 * Utility type for document search results
 */
export interface DocumentSearchResult {
  documentId: string;
  projectId: string;
  title: string;
  contentPreview: string;
  matchContext: string;
  matchCount: number;
  path: Array<{
    id: string;
    title: string;
  }>;
  type: DocumentNode['type'];
  lastModified: string | Date;
  relevanceScore?: number;
}

/**
 * Document content selection range
 */
export interface SelectionRange {
  startOffset: number;
  endOffset: number;
  selectedText: string;
  surroundingContext?: string;
  paragraphIndex?: number;
}

/**
 * Interface for text formatting options
 */
export interface TextFormatting {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  highlight?: boolean | string;
  textColor?: string;
  backgroundColor?: string;
  fontSize?: string | number;
  fontFamily?: string;
  alignment?: 'left' | 'center' | 'right' | 'justify';
  lineHeight?: number | string;
  letterSpacing?: number | string;
  textIndent?: number | string;
  listType?: 'bullet' | 'numbered' | 'checkbox' | 'none';
  heading?: 1 | 2 | 3 | 4 | 5 | 6 | null;
  link?: string;
  subscript?: boolean;
  superscript?: boolean;
  code?: boolean;
  codeBlock?: boolean;
  blockQuote?: boolean;
}

/**
 * Type definition for document batch operations
 */
export type DocumentBatchOperation = {
  operationType: 'create' | 'update' | 'delete' | 'move' | 'duplicate';
  documents: Array<{ 
    id?: string; 
    data?: Partial<DocumentNode> | NewDocument;
    targetId?: string; 
    position?: number;
  }>;
  options?: {
    validateReferences?: boolean;
    updateRelationships?: boolean;
    cascade?: boolean;
    transactional?: boolean;
    notifySubscribers?: boolean;
  };
}

/**
 * Document permission settings for access control
 */
export interface DocumentPermissions {
  /**
   * The document ID this permission set applies to
   */
  documentId: string;
  
  /**
   * The user ID of the owner
   */
  ownerId: string;
  
  /**
   * Per-user permissions
   */
  userPermissions: Record<string, {
    /**
     * Access level for this user
     */
    accessLevel: 'read' | 'comment' | 'edit' | 'admin';
    
    /**
     * When this permission was granted
     */
    grantedAt: string | Date;
    
    /**
     * When this permission expires (if applicable)
     */
    expiresAt?: string | Date;
    
    /**
     * Has the user accepted the permission invitation?
     */
    accepted: boolean;
  }>;
  
  /**
   * Link sharing settings
   */
  linkSharing: {
    /**
     * Is link sharing enabled?
     */
    enabled: boolean;
    
    /**
     * Permission level for anyone with the link
     */
    accessLevel: 'read' | 'comment' | 'edit';
    
    /**
     * The sharing link token
     */
    linkToken?: string;
    
    /**
     * When the link expires (if applicable)
     */
    expiresAt?: string | Date;
    
    /**
     * Require password for link access
     */
    passwordProtected: boolean;
  };
  
  /**
   * Public sharing settings
   */
  publicSharing: {
    /**
     * Is public sharing enabled?
     */
    enabled: boolean;
    
    /**
     * Permission level for public access
     */
    accessLevel: 'read' | 'comment';
    
    /**
     * Allow search engines to index
     */
    allowIndexing: boolean;
  };
  
  /**
   * Inheritance settings
   */
  inheritance: {
    /**
     * Inherit permissions from parent document?
     */
    inheritFromParent: boolean;
    
    /**
     * Apply these permissions to all child documents?
     */
    applyToChildren: boolean;
  };
}

/**
 * Interface for document conflict detection and resolution
 */
export interface DocumentConflict {
  /**
   * Unique identifier for this conflict
   */
  id: string;
  
  /**
   * The document where the conflict occurred
   */
  documentId: string;
  
  /**
   * When the conflict was detected
   */
  detectedAt: string | Date;
  
  /**
   * Current status of the conflict
   */
  status: 'detected' | 'resolved' | 'ignored';
  
  /**
   * Type of conflict
   */
  type: 'concurrent-edit' | 'merge-conflict' | 'sync-conflict' | 'version-mismatch';
  
  /**
   * Users involved in the conflict
   */
  users: string[];
  
  /**
   * Conflicting versions of the document
   */
  versions: Array<{
    /**
     * User who created this version
     */
    userId: string;
    
    /**
     * Content of this version
     */
    content: string;
    
    /**
     * Version number
     */
    version: number;
    
    /**
     * When this version was created
     */
    timestamp: string | Date;
    
    /**
     * Differences from the base version
     */
    diff?: Array<{
      type: 'addition' | 'deletion' | 'modification';
      position: number;
      length: number;
      content: string;
    }>;
  }>;
  
  /**
   * Resolution information (if resolved)
   */
  resolution?: {
    /**
     * How the conflict was resolved
     */
    method: 'manual-merge' | 'accept-version' | 'auto-merge';
    
    /**
     * User who resolved the conflict
     */
    resolvedBy: string;
    
    /**
     * When the conflict was resolved
     */
    resolvedAt: string | Date;
    
    /**
     * ID of the accepted version (if applicable)
     */
    acceptedVersionId?: string;
  };
}

/**
 * Interface for collaborative editing session
 */
export interface CollaborativeSession {
  /**
   * Unique session identifier
   */
  id: string;
  
  /**
   * The document being edited
   */
  documentId: string;
  
  /**
   * Project this document belongs to
   */
  projectId: string;
  
  /**
   * Session start time
   */
  startedAt: string | Date;
  
  /**
   * Session end time (if completed)
   */
  endedAt?: string | Date;
  
  /**
   * Currently active users
   */
  activeUsers: Array<{
    /**
     * User ID
     */
    id: string;
    
    /**
     * User display name
     */
    name: string;
    
    /**
     * User-specific color for cursor/selection
     */
    color: string;
    
    /**
     * Current cursor position
     */
    cursor?: number;
    
    /**
     * Current selection range
     */
    selection?: {
      start: number;
      end: number;
    };
    
    /**
     * Last activity timestamp
     */
    lastActivity: string | Date;
    
    /**
     * User online status
     */
    status: 'active' | 'idle' | 'offline';
  }>;
  
  /**
   * Operation history
   */
  operations: Array<{
    /**
     * Unique operation ID
     */
    id: string;
    
    /**
     * User who performed the operation
     */
    userId: string;
    
    /**
     * Operation type
     */
    type: 'insert' | 'delete' | 'replace' | 'format';
    
    /**
     * Position in the document
     */
    position: number;
    
    /**
     * Length of affected text
     */
    length: number;
    
    /**
     * Content for insert/replace operations
     */
    content?: string;
    
    /**
     * Format attributes for format operations
     */
    attributes?: Record<string, unknown>;
    
    /**
     * Operation timestamp
     */
    timestamp: string | Date;
  }>;
  
  /**
   * Document version at session start
   */
  initialVersion: number;
  
  /**
   * Current document version
   */
  currentVersion: number;
  
  /**
   * Chat messages during the session
   */
  chatMessages?: Array<{
    /**
     * Message ID
     */
    id: string;
    
    /**
     * User who sent the message
     */
    userId: string;
    
    /**
     * Message content
     */
    content: string;
    
    /**
     * When the message was sent
     */
    timestamp: string | Date;
    
    /**
     * Is this message pinned?
     */
    pinned?: boolean;
  }>;
}

/**
 * Interface for document comments
 */
export interface DocumentComment {
  /**
   * Unique comment identifier
   */
  id: string;
  
  /**
   * Document this comment belongs to
   */
  documentId: string;
  
  /**
   * User who created the comment
   */
  userId: string;
  
  /**
   * User's display name
   */
  userName: string;
  
  /**
   * Comment content
   */
  content: string;
  
  /**
   * When the comment was created
   */
  createdAt: string | Date;
  
  /**
   * When the comment was last updated
   */
  updatedAt: string | Date;
  
  /**
   * Is this comment resolved?
   */
  resolved: boolean;
  
  /**
   * Who resolved the comment (if resolved)
   */
  resolvedBy?: string;
  
  /**
   * When the comment was resolved
   */
  resolvedAt?: string | Date;
  
  /**
   * Comment replies
   */
  replies?: DocumentComment[];
  
  /**
   * Text selection this comment applies to
   */
  selection?: {
    /**
     * Start position in the document
     */
    start: number;
    
    /**
     * End position in the document
     */
    end: number;
    
    /**
     * The text that was selected
     */
    text: string;
  };
  
  /**
   * Comment type
   */
  type: 'general' | 'suggestion' | 'question' | 'issue' | 'praise' | 'edit';
  
  /**
   * Users who have reacted to this comment
   */
  reactions?: Record<string, string[]>; // e.g. { "👍": ["user1", "user2"], "❤️": ["user3"] }
}

/**
 * Interface for user notifications
 */
export interface UserNotification {
  /**
   * Unique notification identifier
   */
  id: string;
  
  /**
   * User this notification is for
   */
  userId: string;
  
  /**
   * Notification type
   */
  type: 'comment' | 'mention' | 'share' | 'edit' | 'system' | 'deadline' | 'achievement';
  
  /**
   * Brief notification title
   */
  title: string;
  
  /**
   * Notification message
   */
  message: string;
  
  /**
   * When the notification was created
   */
  createdAt: string | Date;
  
  /**
   * Has the user read this notification?
   */
  read: boolean;
  
  /**
   * When the user read this notification
   */
  readAt?: string | Date;
  
  /**
   * Resource information
   */
  resource: {
    /**
     * Resource type
     */
    type: 'project' | 'document' | 'comment' | 'user';
    
    /**
     * Resource ID
     */
    id: string;
    
    /**
     * Link to the resource
     */
    link?: string;
  };
  
  /**
   * Notification priority
   */
  priority: 'low' | 'normal' | 'high' | 'urgent';
  
  /**
   * Notification expiration date
   */
  expiresAt?: string | Date;
  
  /**
   * Additional context data
   */
  contextData?: Record<string, unknown>;
}

/**
 * Interface for document import results
 */
export interface ImportResult {
  /**
   * Unique import identifier
   */
  id: string;
  
  /**
   * Source file information
   */
  source: {
    /**
     * Original filename
     */
    filename: string;
    
    /**
     * File format
     */
    format: string;
    
    /**
     * File size in bytes
     */
    size: number;
    
    /**
     * When the file was imported
     */
    importedAt: string | Date;
  };
  
  /**
   * Status of the import
   */
  status: 'success' | 'partial' | 'failed' | 'in-progress';
  
  /**
   * Project ID where documents were imported
   */
  projectId: string;
  
  /**
   * Imported document IDs
   */
  importedDocuments: string[];
  
  /**
   * Statistics about the import
   */
  stats: {
    /**
     * Total documents created
     */
    documentsCreated: number;
    
    /**
     * Total words imported
     */
    totalWordCount: number;
    
    /**
     * Processing time in milliseconds
     */
    processingTime: number;
    
    /**
     * Number of issues encountered
     */
    issuesCount: number;
  };
  
  /**
   * Issues encountered during import
   */
  issues?: Array<{
    /**
     * Issue type
     */
    type: 'format-error' | 'structure-error' | 'unsupported-content' | 'data-loss';
    
    /**
     * Issue message
     */
    message: string;
    
    /**
     * Severity level
     */
    severity: 'warning' | 'error';
    
    /**
     * Location in the source file
     */
    location?: string;
  }>;
  
  /**
   * Options used for the import
   */
  importOptions: {
    /**
     * Split large documents?
     */
    splitByHeadings?: boolean;
    
    /**
     * Preserve formatting?
     */
    preserveFormatting?: boolean;
    
    /**
     * Extract metadata?
     */
    extractMetadata?: boolean;
    
    /**
     * Target document format
     */
    targetFormat?: ContentFormat;
  };
}

/**
 * Interface for offline edit queue
 */
export interface OfflineEditQueue {
  /**
   * All pending operations to be synced
   */
  pendingOperations: Array<{
    /**
     * Unique operation identifier
     */
    id: string;
    
    /**
     * When the operation was created
     */
    timestamp: string | Date;
    
    /**
     * Type of operation
     */
    type: 'create' | 'update' | 'delete' | 'move';
    
    /**
     * Resource type
     */
    resourceType: 'document' | 'project' | 'comment';
    
    /**
     * Resource ID
     */
    resourceId: string;
    
    /**
     * Data for the operation
     */
    data: Record<string, unknown>;
    
    /**
     * Retry attempts
     */
    retryCount: number;
    
    /**
     * Last error encountered
     */
    lastError?: string;
    
    /**
     * Local version (for conflict detection)
     */
    localVersion: number;
    
    /**
     * Base remote version when operation was created
     */
    baseRemoteVersion: number;
  }>;
  
  /**
   * Queue status
   */
  status: 'idle' | 'syncing' | 'error' | 'conflict';
  
  /**
   * Last sync information
   */
  lastSync: {
    /**
     * When the last sync attempt occurred
     */
    timestamp?: string | Date;
    
    /**
     * Success or failure
     */
    success: boolean;
    
    /**
     * Error message if failed
     */
    error?: string;
    
    /**
     * Operations synced
     */
    operationsSynced: number;
  };
  
  /**
   * Conflicts to be resolved
   */
  conflicts: Array<{
    /**
     * Operation ID with a conflict
     */
    operationId: string;
    
    /**
     * Resource ID
     */
    resourceId: string;
    
    /**
     * Conflict type
     */
    type: 'version-mismatch' | 'already-deleted' | 'parent-changed';
    
    /**
     * Local version
     */
    localVersion: number;
    
    /**
     * Remote version
     */
    remoteVersion: number;
    
    /**
     * Resolution strategy
     */
    resolutionStrategy?: 'use-local' | 'use-remote' | 'merge' | 'manual';
  }>;
}
