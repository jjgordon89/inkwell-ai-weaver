import React, { useMemo, useState } from 'react';
import { 
  Folder,
  File, 
  FileText, 
  BookOpen, 
  Users, 
  Map, 
  Bookmark,
  MessageSquare,
  Film,
  GraduationCap,
  Sparkles,
  ChevronRight,
  Search,
  Info,
  XCircle,
  BookText,
  Book,
  CalendarDays
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DocumentStructureSettings } from './DocumentStructureCustomizer';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface DocumentTreeVisualizerProps {
  structure: 'novel' | 'screenplay' | 'research' | 'poetry' | 'academic' | 'memoir' | 'nonfiction';
  settings: DocumentStructureSettings;
}

interface NodeData {
  type: 'folder' | 'file' | 'section';
  description?: string;
  sampleContent?: string;
  estimatedWords?: number;
  tags?: string[];
}

interface TreeNodeProps {
  label: string;
  icon: React.ReactNode;
  depth?: number;
  children?: React.ReactNode;
  isLast?: boolean;
  nodeData?: NodeData;
  searchTerm?: string;
}

const TreeNode: React.FC<TreeNodeProps> = ({ 
  label, 
  icon, 
  depth = 0, 
  children, 
  isLast = false,
  nodeData,
  searchTerm = ''
}) => {
  const [expanded, setExpanded] = React.useState(depth < 1);
  
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
  
  // Check if this node matches the search term
  const isMatch = searchTerm ? 
    label.toLowerCase().includes(searchTerm.toLowerCase()) : 
    false;
  
  // Automatically expand parent nodes if a child matches the search
  React.useEffect(() => {
    if (searchTerm && children && !expanded) {
      setExpanded(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, children]);
  
  // Content for tooltip
  const tooltipContent = nodeData ? (
    <div className="max-w-xs">
      {nodeData.description && (
        <p className="text-xs mb-1">{nodeData.description}</p>
      )}
      {nodeData.estimatedWords && (
        <p className="text-xs text-muted-foreground">~{nodeData.estimatedWords} words</p>
      )}
      {nodeData.sampleContent && (
        <div className="mt-2 pt-2 border-t border-border">
          <p className="text-xs italic text-muted-foreground">{nodeData.sampleContent}</p>
        </div>
      )}
      {nodeData.tags && nodeData.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {nodeData.tags.map((tag, i) => (
            <Badge key={i} variant="outline" className="text-[0.65rem] px-1">{tag}</Badge>
          ))}
        </div>
      )}
    </div>
  ) : null;
  
  return (
    <div className={cn(
      "select-none", 
      isMatch && "bg-primary/10 rounded-md"
    )}>
      <div 
        className={cn(
          "flex items-center py-1 rounded hover:bg-muted/50 transition-colors",
          depth > 0 && "ml-4 pl-2",
          isLast && "border-l-0"
        )}
      >
        {children && (
          <button
            onClick={toggleExpanded}
            className="mr-1 p-0.5 rounded-sm hover:bg-muted"
            aria-label={expanded ? "Collapse" : "Expand"}
            tabIndex={0}
          >
            <ChevronRight 
              className={cn(
                "h-3.5 w-3.5 text-muted-foreground/70 transition-transform", 
                expanded && "transform rotate-90"
              )} 
            />
          </button>
        )}
        
        <TooltipProvider>
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <div className="flex items-center">
                <span className="mr-2">{icon}</span>
                <span className={cn(
                  "text-sm",
                  isMatch && "font-medium text-primary"
                )}>
                  {label}
                </span>
                {nodeData && <Info className="h-3 w-3 ml-1.5 text-muted-foreground/50" />}
              </div>
            </TooltipTrigger>
            {tooltipContent && (
              <TooltipContent side="right" align="start">
                {tooltipContent}
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {children && expanded && (
        <div className="ml-4 pl-3 border-l border-border">
          {children}
        </div>
      )}
    </div>
  );
};

const DocumentTreeVisualizer: React.FC<DocumentTreeVisualizerProps> = ({ 
  structure, 
  settings 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [nodeCount, setNodeCount] = useState(0);
  
  // Calculate structure stats
  const stats = useMemo(() => {
    let count = 0;
    let wordEstimate = 0;
    
    switch (structure) {
      case 'novel':
        count = 7 + settings.chapterCount + (settings.chapterCount * settings.scenesPerChapter);
        wordEstimate = settings.chapterCount * settings.scenesPerChapter * 1500; // Avg 1500 words per scene
        break;
      case 'screenplay':
        count = 5 + settings.actCount * 7;
        wordEstimate = settings.actCount * 5000; // Avg 5000 words per act
        break;
      case 'poetry':
        count = 6 + settings.poemCount;
        wordEstimate = settings.poemCount * 300; // Avg 300 words per poem
        break;
      case 'research':
        count = 8 + settings.researchSections;
        wordEstimate = 1000 + settings.researchSections * 1500; // Avg 1500 words per section
        break;
      case 'academic':
        count = 12 + settings.academicSections;
        wordEstimate = 2300 + settings.academicSections * 2000 + 8500 + 1500; // Front matter, sections, main content, back matter
        break;
      case 'memoir':
        count = 12 + settings.memoirChapters;
        wordEstimate = 700 + settings.memoirChapters * 3500 + 1200 + 1500 + 2000; // Front matter, chapters, timeline, people, reflections
        break;
      case 'nonfiction':
        count = 13 + settings.nonfictionSections;
        wordEstimate = 1000 + 4000 + settings.nonfictionSections * 4000 + 3000 + 3000; // Front matter, intro/conclusion, sections, research, back matter
        break;
    }
    
    setNodeCount(count);
    return { count, wordEstimate };
  }, [structure, settings]);
  
  // Generate structure based on template type
  const treeStructure = useMemo(() => {
    switch (structure) {
      case 'novel':
        return renderNovelStructure(settings, searchTerm);
      case 'screenplay':
        return renderScreenplayStructure(settings, searchTerm);
      case 'poetry':
        return renderPoetryStructure(settings, searchTerm);
      case 'research':
        return renderResearchStructure(settings, searchTerm);
      case 'academic':
        return renderAcademicStructure(settings, searchTerm);
      case 'memoir':
        return renderMemoirStructure(settings, searchTerm);
      case 'nonfiction':
        return renderNonfictionStructure(settings, searchTerm);
      default:
        return null;
    }
  }, [structure, settings, searchTerm]);
  
  const handleClearSearch = () => {
    setSearchTerm('');
  };
  
  return (
    <div className="space-y-3">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search document structure..."
          className="pl-8 pr-8 text-sm h-9"
        />
        {searchTerm && (
          <button
            onClick={handleClearSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <XCircle className="h-4 w-4" />
          </button>
        )}
      </div>
      
      {/* Structure stats */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <div>
          <span>Total nodes: </span>
          <Badge variant="outline" className="ml-1">{nodeCount}</Badge>
        </div>
        <div>
          <span>Est. words: </span>
          <Badge variant="outline" className="ml-1">{stats.wordEstimate.toLocaleString()}</Badge>
        </div>
      </div>
      
      {/* Tree visualization */}
      <div className="bg-muted/30 rounded-md border border-border p-3 max-h-[300px] overflow-y-auto">
        <div className="text-sm font-medium mb-2">Document Structure Preview</div>
        <div className="space-y-1">
          {treeStructure}
        </div>
      </div>
    </div>
  );
};

// Helper functions to render different structure types
function renderNovelStructure(settings: DocumentStructureSettings, searchTerm: string = '') {
  return (
    <>
      <TreeNode 
        label="Front Matter" 
        icon={<Folder className="h-4 w-4 text-primary" />}
        nodeData={{
          type: 'folder',
          description: 'Contains title page and basic information about your novel',
          estimatedWords: 500,
          tags: ['metadata', 'introduction']
        }}
        searchTerm={searchTerm}
      >
        <TreeNode 
          label="Title Page" 
          icon={<FileText className="h-4 w-4 text-muted-foreground" />}
          nodeData={{
            type: 'file',
            description: 'The title page for your novel',
            sampleContent: 'My Novel Title\nBy Author Name\n© 2025',
            estimatedWords: 100,
            tags: ['title', 'metadata']
          }}
          searchTerm={searchTerm}
        />
        <TreeNode 
          label="Synopsis" 
          icon={<FileText className="h-4 w-4 text-muted-foreground" />}
          nodeData={{
            type: 'file',
            description: 'A brief summary of your novel',
            sampleContent: 'A captivating story about...',
            estimatedWords: 400,
            tags: ['summary', 'plot']
          }}
          searchTerm={searchTerm}
          isLast={true}
        />
      </TreeNode>
      
      <TreeNode 
        label="Manuscript" 
        icon={<Folder className="h-4 w-4 text-primary" />}
        nodeData={{
          type: 'folder',
          description: 'The main content of your novel',
          estimatedWords: settings.chapterCount * settings.scenesPerChapter * 1500,
          tags: ['content', 'chapters']
        }}
        searchTerm={searchTerm}
      >
        {Array.from({ length: Math.min(settings.chapterCount, 5) }).map((_, i) => (
          <TreeNode 
            key={`chapter-${i}`}
            label={`Chapter ${i + 1}`}
            icon={<Bookmark className="h-4 w-4 text-amber-500" />}
            nodeData={{
              type: 'section',
              description: `Chapter ${i + 1} of your novel`,
              sampleContent: i === 0 ? 'The beginning of a great adventure...' : undefined,
              estimatedWords: settings.scenesPerChapter * 1500,
              tags: ['chapter', 'content']
            }}
            searchTerm={searchTerm}
            isLast={i === Math.min(settings.chapterCount, 5) - 1 && settings.chapterCount <= 5}
          >
            {Array.from({ length: Math.min(settings.scenesPerChapter, 3) }).map((_, j) => (
              <TreeNode 
                key={`scene-${i}-${j}`}
                label={`Scene ${j + 1}`}
                icon={<File className="h-4 w-4 text-muted-foreground" />}
                nodeData={{
                  type: 'file',
                  description: `Scene ${j + 1} in Chapter ${i + 1}`,
                  sampleContent: j === 0 && i === 0 ? 'The character entered the room, sensing something was wrong...' : undefined,
                  estimatedWords: 1500,
                  tags: ['scene', 'content']
                }}
                searchTerm={searchTerm}
                isLast={j === Math.min(settings.scenesPerChapter, 3) - 1}
                depth={2}
              />
            ))}
            {settings.scenesPerChapter > 3 && (
              <TreeNode 
                label={`... ${settings.scenesPerChapter - 3} more scenes`}
                icon={<File className="h-4 w-4 text-muted-foreground/50" />}
                searchTerm={searchTerm}
                isLast={true}
                depth={2}
              />
            )}
          </TreeNode>
        ))}
        {settings.chapterCount > 5 && (
          <TreeNode 
            label={`... ${settings.chapterCount - 5} more chapters`}
            icon={<Bookmark className="h-4 w-4 text-amber-500/50" />}
            searchTerm={searchTerm}
            isLast={true}
          />
        )}
      </TreeNode>
      
      <TreeNode 
        label="Characters" 
        icon={<Folder className="h-4 w-4 text-primary" />}
        nodeData={{
          type: 'folder',
          description: 'Character profiles and information',
          estimatedWords: 1500,
          tags: ['characters', 'profiles']
        }}
        searchTerm={searchTerm}
      >
        <TreeNode 
          label="Character Template" 
          icon={<Users className="h-4 w-4 text-sky-500" />}
          nodeData={{
            type: 'file',
            description: 'Template for creating character profiles',
            sampleContent: 'Name:\nAge:\nBackground:\nMotivation:\nAppearance:',
            estimatedWords: 300,
            tags: ['template', 'character']
          }}
          searchTerm={searchTerm}
        />
        <TreeNode 
          label="Main Character" 
          icon={<Users className="h-4 w-4 text-sky-500" />}
          nodeData={{
            type: 'file',
            description: 'Profile for the main character',
            sampleContent: 'Name: John Doe\nAge: 35\nBackground: Former detective...',
            estimatedWords: 600,
            tags: ['character', 'protagonist']
          }}
          searchTerm={searchTerm}
          isLast={true}
        />
      </TreeNode>
      
      <TreeNode 
        label="Settings" 
        icon={<Folder className="h-4 w-4 text-primary" />}
        nodeData={{
          type: 'folder',
          description: 'Locations and settings in your novel',
          estimatedWords: 1200,
          tags: ['settings', 'locations']
        }}
        searchTerm={searchTerm}
      >
        <TreeNode 
          label="Setting Template" 
          icon={<Map className="h-4 w-4 text-emerald-500" />}
          nodeData={{
            type: 'file',
            description: 'Template for creating setting descriptions',
            sampleContent: 'Name:\nLocation:\nDescription:\nSignificance:',
            estimatedWords: 300,
            tags: ['template', 'setting']
          }}
          searchTerm={searchTerm}
        />
        <TreeNode 
          label="Main Setting" 
          icon={<Map className="h-4 w-4 text-emerald-500" />}
          nodeData={{
            type: 'file',
            description: 'Description of the main setting',
            sampleContent: 'Name: Old Town\nLocation: Northern district\nDescription: Cobblestone streets lined with...',
            estimatedWords: 600,
            tags: ['setting', 'location']
          }}
          searchTerm={searchTerm}
          isLast={true}
        />
      </TreeNode>
      
      <TreeNode 
        label="Notes" 
        icon={<Folder className="h-4 w-4 text-primary" />}
        nodeData={{
          type: 'folder',
          description: 'Research and notes for your novel',
          estimatedWords: 1000,
          tags: ['notes', 'research']
        }}
        searchTerm={searchTerm}
        isLast={true}
      >
        <TreeNode 
          label="Research Notes" 
          icon={<FileText className="h-4 w-4 text-violet-500" />}
          nodeData={{
            type: 'file',
            description: 'Research and background information',
            sampleContent: 'Historical context for the story...',
            estimatedWords: 1000,
            tags: ['research', 'background']
          }}
          searchTerm={searchTerm}
          isLast={true}
        />
      </TreeNode>
    </>
  );
}

function renderScreenplayStructure(settings: DocumentStructureSettings, searchTerm: string = '') {
  return (
    <>
      <TreeNode 
        label="Front Matter" 
        icon={<Folder className="h-4 w-4 text-primary" />}
        nodeData={{
          type: 'folder',
          description: 'Contains title page and basic information about your screenplay',
          estimatedWords: 500,
          tags: ['metadata', 'introduction']
        }}
        searchTerm={searchTerm}
      >
        <TreeNode 
          label="Title Page" 
          icon={<FileText className="h-4 w-4 text-muted-foreground" />}
          nodeData={{
            type: 'file',
            description: 'The title page for your screenplay',
            sampleContent: 'TITLE\n\nWritten by\n\nAuthor Name',
            estimatedWords: 100,
            tags: ['title', 'metadata']
          }}
          searchTerm={searchTerm}
        />
        <TreeNode 
          label="Synopsis" 
          icon={<FileText className="h-4 w-4 text-muted-foreground" />}
          nodeData={{
            type: 'file',
            description: 'A brief summary of your screenplay',
            sampleContent: 'A screenplay about...',
            estimatedWords: 400,
            tags: ['summary', 'plot']
          }}
          searchTerm={searchTerm}
          isLast={true}
        />
      </TreeNode>
      
      <TreeNode 
        label="Screenplay" 
        icon={<Folder className="h-4 w-4 text-primary" />}
        nodeData={{
          type: 'folder',
          description: 'The main content of your screenplay',
          estimatedWords: settings.actCount * 5000,
          tags: ['content', 'acts']
        }}
        searchTerm={searchTerm}
      >
        {Array.from({ length: Math.min(settings.actCount, 5) }).map((_, i) => (
          <TreeNode 
            key={`act-${i}`}
            label={`Act ${i + 1}`}
            icon={<Film className="h-4 w-4 text-amber-500" />}
            nodeData={{
              type: 'section',
              description: `Act ${i + 1} of your screenplay`,
              sampleContent: i === 0 ? 'FADE IN:\n\nEXT. LOCATION - DAY\n\nAction description...' : undefined,
              estimatedWords: 5000,
              tags: ['act', 'content']
            }}
            searchTerm={searchTerm}
            isLast={i === Math.min(settings.actCount, 5) - 1 && settings.actCount <= 5}
          >
            <TreeNode 
              label="Act Introduction"
              icon={<FileText className="h-4 w-4 text-muted-foreground" />}
              nodeData={{
                type: 'file',
                description: `Introduction to Act ${i + 1}`,
                sampleContent: `ACT ${i + 1} - ${i === 0 ? 'SETUP' : i === 1 ? 'CONFRONTATION' : 'RESOLUTION'}`,
                estimatedWords: 500,
                tags: ['introduction', 'act']
              }}
              searchTerm={searchTerm}
            />
            <TreeNode 
              label="Key Scenes"
              icon={<Folder className="h-4 w-4 text-muted-foreground" />}
              nodeData={{
                type: 'folder',
                description: `Major scenes in Act ${i + 1}`,
                estimatedWords: 4500,
                tags: ['scenes', 'content']
              }}
              searchTerm={searchTerm}
              isLast={true}
            >
              <TreeNode 
                label="Scene 1"
                icon={<MessageSquare className="h-4 w-4 text-muted-foreground" />}
                nodeData={{
                  type: 'file',
                  description: `First scene in Act ${i + 1}`,
                  sampleContent: 'INT. LOCATION - DAY\n\nCHARACTER\nDialog goes here...',
                  estimatedWords: 1500,
                  tags: ['scene', 'dialog']
                }}
                searchTerm={searchTerm}
              />
              <TreeNode 
                label="Scene 2"
                icon={<MessageSquare className="h-4 w-4 text-muted-foreground" />}
                nodeData={{
                  type: 'file',
                  description: `Second scene in Act ${i + 1}`,
                  sampleContent: 'EXT. LOCATION - NIGHT\n\nAction description...',
                  estimatedWords: 1500,
                  tags: ['scene', 'action']
                }}
                searchTerm={searchTerm}
                isLast={true}
              />
            </TreeNode>
          </TreeNode>
        ))}
        {settings.actCount > 5 && (
          <TreeNode 
            label={`... ${settings.actCount - 5} more acts`}
            icon={<Film className="h-4 w-4 text-amber-500/50" />}
            searchTerm={searchTerm}
            isLast={true}
          />
        )}
      </TreeNode>
      
      <TreeNode 
        label="Characters" 
        icon={<Folder className="h-4 w-4 text-primary" />}
        nodeData={{
          type: 'folder',
          description: 'Character profiles for your screenplay',
          estimatedWords: 1500,
          tags: ['characters', 'profiles']
        }}
        searchTerm={searchTerm}
      >
        <TreeNode 
          label="Character Template" 
          icon={<Users className="h-4 w-4 text-sky-500" />}
          nodeData={{
            type: 'file',
            description: 'Template for creating character profiles',
            sampleContent: 'NAME:\nAGE:\nARCHETYPE:\nBACKGROUND:\nMOTIVATION:',
            estimatedWords: 300,
            tags: ['template', 'character']
          }}
          searchTerm={searchTerm}
        />
        <TreeNode 
          label="Dialogue Templates" 
          icon={<MessageSquare className="h-4 w-4 text-sky-500" />}
          nodeData={{
            type: 'file',
            description: 'Examples of character dialogue styles',
            sampleContent: 'CHARACTER\n(pausing)\nDialog with direction...',
            estimatedWords: 800,
            tags: ['dialog', 'examples']
          }}
          searchTerm={searchTerm}
          isLast={true}
        />
      </TreeNode>
      
      <TreeNode 
        label="Locations" 
        icon={<Folder className="h-4 w-4 text-primary" />}
        nodeData={{
          type: 'folder',
          description: 'Setting descriptions for your screenplay',
          estimatedWords: 1000,
          tags: ['locations', 'settings']
        }}
        searchTerm={searchTerm}
      >
        <TreeNode 
          label="Location Template" 
          icon={<Map className="h-4 w-4 text-emerald-500" />}
          nodeData={{
            type: 'file',
            description: 'Template for creating location descriptions',
            sampleContent: 'LOCATION NAME:\nINT/EXT:\nTIME OF DAY:\nDESCRIPTION:',
            estimatedWords: 300,
            tags: ['template', 'location']
          }}
          searchTerm={searchTerm}
          isLast={true}
        />
      </TreeNode>
      
      <TreeNode 
        label="Notes" 
        icon={<Folder className="h-4 w-4 text-primary" />}
        nodeData={{
          type: 'folder',
          description: 'Production notes and additional information',
          estimatedWords: 1000,
          tags: ['notes', 'production']
        }}
        searchTerm={searchTerm}
        isLast={true}
      >
        <TreeNode 
          label="Production Notes" 
          icon={<FileText className="h-4 w-4 text-violet-500" />}
          nodeData={{
            type: 'file',
            description: 'Notes on production requirements',
            sampleContent: 'Budget considerations...\nSpecial effects needed...',
            estimatedWords: 1000,
            tags: ['production', 'planning']
          }}
          searchTerm={searchTerm}
          isLast={true}
        />
      </TreeNode>
    </>
  );
}

function renderPoetryStructure(settings: DocumentStructureSettings, searchTerm: string = '') {
  return (
    <>
      <TreeNode 
        label="Collection" 
        icon={<Folder className="h-4 w-4 text-primary" />}
        nodeData={{
          type: 'folder',
          description: 'Contains all poems and collection information',
          estimatedWords: settings.poemCount * 300,
          tags: ['collection', 'poetry']
        }}
        searchTerm={searchTerm}
      >
        <TreeNode 
          label="Title Page" 
          icon={<FileText className="h-4 w-4 text-muted-foreground" />}
          nodeData={{
            type: 'file',
            description: 'The title page for your poetry collection',
            sampleContent: 'Collection Title\nBy Poet Name\n© 2025',
            estimatedWords: 100,
            tags: ['title', 'metadata']
          }}
          searchTerm={searchTerm}
        />
        <TreeNode 
          label="Introduction" 
          icon={<FileText className="h-4 w-4 text-muted-foreground" />}
          nodeData={{
            type: 'file',
            description: 'Introduction to your poetry collection',
            sampleContent: 'This collection explores themes of...',
            estimatedWords: 500,
            tags: ['introduction', 'context']
          }}
          searchTerm={searchTerm}
        />
        <TreeNode 
          label="Poems"
          icon={<Folder className="h-4 w-4 text-primary" />}
          nodeData={{
            type: 'folder',
            description: 'Individual poems in your collection',
            estimatedWords: settings.poemCount * 300,
            tags: ['poems', 'content']
          }}
          searchTerm={searchTerm}
          isLast={true}
        >
          {Array.from({ length: Math.min(settings.poemCount, 5) }).map((_, i) => (
            <TreeNode 
              key={`poem-${i}`}
              label={`Poem ${i + 1}`}
              icon={<Sparkles className="h-4 w-4 text-amber-500" />}
              nodeData={{
                type: 'file',
                description: `Poem ${i + 1} in your collection`,
                sampleContent: i === 0 ? 'Words flow like water\nAcross the empty page\nFilling it with life' : undefined,
                estimatedWords: 300,
                tags: ['poem', i === 0 ? 'opening' : i === settings.poemCount - 1 ? 'closing' : 'middle']
              }}
              searchTerm={searchTerm}
              isLast={i === Math.min(settings.poemCount, 5) - 1 && settings.poemCount <= 5}
            />
          ))}
          {settings.poemCount > 5 && (
            <TreeNode 
              label={`... ${settings.poemCount - 5} more poems`}
              icon={<Sparkles className="h-4 w-4 text-amber-500/50" />}
              searchTerm={searchTerm}
              isLast={true}
            />
          )}
        </TreeNode>
      </TreeNode>
      
      <TreeNode 
        label="Themes" 
        icon={<Folder className="h-4 w-4 text-primary" />}
        nodeData={{
          type: 'folder',
          description: 'Thematic elements and motifs in your poetry',
          estimatedWords: 800,
          tags: ['themes', 'analysis']
        }}
        searchTerm={searchTerm}
      >
        <TreeNode 
          label="Theme Notes" 
          icon={<FileText className="h-4 w-4 text-violet-500" />}
          nodeData={{
            type: 'file',
            description: 'Notes on themes and motifs',
            sampleContent: 'Primary themes:\n- Nature and humanity\n- Time and memory\n- Love and loss',
            estimatedWords: 800,
            tags: ['themes', 'notes']
          }}
          searchTerm={searchTerm}
          isLast={true}
        />
      </TreeNode>
      
      <TreeNode 
        label="References" 
        icon={<Folder className="h-4 w-4 text-primary" />}
        nodeData={{
          type: 'folder',
          description: 'Stylistic references and influences',
          estimatedWords: 600,
          tags: ['references', 'style']
        }}
        searchTerm={searchTerm}
        isLast={true}
      >
        <TreeNode 
          label="Style References" 
          icon={<FileText className="h-4 w-4 text-emerald-500" />}
          nodeData={{
            type: 'file',
            description: 'References to poetic styles and influences',
            sampleContent: 'Poetic forms:\n- Haiku\n- Sonnet\n- Free verse\n\nInfluences:\n- Emily Dickinson\n- Pablo Neruda',
            estimatedWords: 600,
            tags: ['style', 'influences']
          }}
          searchTerm={searchTerm}
          isLast={true}
        />
      </TreeNode>
    </>
  );
}

function renderResearchStructure(settings: DocumentStructureSettings, searchTerm: string = '') {
  return (
    <>
      <TreeNode 
        label="Front Matter" 
        icon={<Folder className="h-4 w-4 text-primary" />}
        nodeData={{
          type: 'folder',
          description: 'Contains title page and abstract for your research paper',
          estimatedWords: 700,
          tags: ['metadata', 'introduction']
        }}
        searchTerm={searchTerm}
      >
        <TreeNode 
          label="Title Page" 
          icon={<FileText className="h-4 w-4 text-muted-foreground" />}
          nodeData={{
            type: 'file',
            description: 'The title page for your research paper',
            sampleContent: 'Title: Research on...\nAuthor: Researcher Name\nAffiliation: Institution',
            estimatedWords: 200,
            tags: ['title', 'metadata']
          }}
          searchTerm={searchTerm}
        />
        <TreeNode 
          label="Abstract" 
          icon={<FileText className="h-4 w-4 text-muted-foreground" />}
          nodeData={{
            type: 'file',
            description: 'A concise summary of your research',
            sampleContent: 'This research investigates the relationship between...',
            estimatedWords: 500,
            tags: ['abstract', 'summary']
          }}
          searchTerm={searchTerm}
          isLast={true}
        />
      </TreeNode>
      
      <TreeNode 
        label="Main Document" 
        icon={<Folder className="h-4 w-4 text-primary" />}
        nodeData={{
          type: 'folder',
          description: 'The main content of your research paper',
          estimatedWords: 1000 + settings.researchSections * 1500,
          tags: ['content', 'research']
        }}
        searchTerm={searchTerm}
      >
        <TreeNode 
          label="Introduction" 
          icon={<GraduationCap className="h-4 w-4 text-amber-500" />}
          nodeData={{
            type: 'file',
            description: 'Introduction to your research paper',
            sampleContent: 'This paper examines the growing field of...',
            estimatedWords: 1000,
            tags: ['introduction', 'context']
          }}
          searchTerm={searchTerm}
        />
        <TreeNode 
          label="Methodology" 
          icon={<GraduationCap className="h-4 w-4 text-amber-500" />}
          nodeData={{
            type: 'file',
            description: 'Research methodology and approach',
            sampleContent: 'Data was collected through a series of experiments...',
            estimatedWords: 1200,
            tags: ['methodology', 'process']
          }}
          searchTerm={searchTerm}
        />
        <TreeNode 
          label="Research Sections"
          icon={<Folder className="h-4 w-4 text-primary" />}
          nodeData={{
            type: 'folder',
            description: 'Main research content sections',
            estimatedWords: settings.researchSections * 1500,
            tags: ['sections', 'findings']
          }}
          searchTerm={searchTerm}
        >
          {Array.from({ length: Math.min(settings.researchSections, 5) }).map((_, i) => (
            <TreeNode 
              key={`section-${i}`}
              label={`Section ${i + 1}`}
              icon={<GraduationCap className="h-4 w-4 text-amber-500" />}
              nodeData={{
                type: 'file',
                description: `Research section ${i + 1}`,
                sampleContent: i === 0 ? 'Analysis of primary findings shows that...' : undefined,
                estimatedWords: 1500,
                tags: ['research', 'analysis']
              }}
              searchTerm={searchTerm}
              isLast={i === Math.min(settings.researchSections, 5) - 1 && settings.researchSections <= 5}
            />
          ))}
          {settings.researchSections > 5 && (
            <TreeNode 
              label={`... ${settings.researchSections - 5} more sections`}
              icon={<GraduationCap className="h-4 w-4 text-amber-500/50" />}
              searchTerm={searchTerm}
              isLast={true}
            />
          )}
        </TreeNode>
        <TreeNode 
          label="Discussion" 
          icon={<FileText className="h-4 w-4 text-muted-foreground" />}
          nodeData={{
            type: 'file',
            description: 'Discussion of research findings',
            sampleContent: 'The results indicate several key insights...',
            estimatedWords: 1500,
            tags: ['discussion', 'analysis']
          }}
          searchTerm={searchTerm}
        />
        <TreeNode 
          label="Conclusion" 
          icon={<FileText className="h-4 w-4 text-muted-foreground" />}
          nodeData={{
            type: 'file',
            description: 'Conclusion of your research paper',
            sampleContent: 'In conclusion, this research demonstrates...',
            estimatedWords: 800,
            tags: ['conclusion', 'summary']
          }}
          searchTerm={searchTerm}
          isLast={true}
        />
      </TreeNode>
      
      <TreeNode 
        label="References" 
        icon={<Folder className="h-4 w-4 text-primary" />}
        nodeData={{
          type: 'folder',
          description: 'Citations and references',
          estimatedWords: 1000,
          tags: ['references', 'citations']
        }}
        searchTerm={searchTerm}
      >
        <TreeNode 
          label="Bibliography" 
          icon={<FileText className="h-4 w-4 text-violet-500" />}
          nodeData={{
            type: 'file',
            description: 'List of references and citations',
            sampleContent: 'Author, A. (2023). Title of work. Journal Name, Volume(Issue), pages.',
            estimatedWords: 1000,
            tags: ['bibliography', 'citations']
          }}
          searchTerm={searchTerm}
          isLast={true}
        />
      </TreeNode>
      
      <TreeNode 
        label="Appendices" 
        icon={<Folder className="h-4 w-4 text-primary" />}
        nodeData={{
          type: 'folder',
          description: 'Supplementary materials and data',
          estimatedWords: 1500,
          tags: ['appendices', 'data']
        }}
        searchTerm={searchTerm}
        isLast={true}
      >
        <TreeNode 
          label="Data Tables" 
          icon={<FileText className="h-4 w-4 text-emerald-500" />}
          nodeData={{
            type: 'file',
            description: 'Raw data and statistical tables',
            sampleContent: 'Table 1: Results of experiment...\n\nTable 2: Statistical analysis...',
            estimatedWords: 1500,
            tags: ['data', 'tables']
          }}
          searchTerm={searchTerm}
          isLast={true}
        />
      </TreeNode>
    </>
  );
}

function renderAcademicStructure(settings: DocumentStructureSettings, searchTerm: string = '') {
  return (
    <>
      <TreeNode 
        label="Front Matter" 
        icon={<Folder className="h-4 w-4 text-primary" />}
        nodeData={{
          type: 'folder',
          description: 'Contains title page and essential preliminary information',
          estimatedWords: 800,
          tags: ['metadata', 'front-matter']
        }}
        searchTerm={searchTerm}
      >
        <TreeNode 
          label="Title Page" 
          icon={<FileText className="h-4 w-4 text-muted-foreground" />}
          nodeData={{
            type: 'file',
            description: 'The title page with author information',
            sampleContent: 'Title: Academic Research on...\nAuthor: Name\nInstitution: University\nDate: July 2025',
            estimatedWords: 200,
            tags: ['title', 'metadata']
          }}
          searchTerm={searchTerm}
        />
        <TreeNode 
          label="Abstract" 
          icon={<FileText className="h-4 w-4 text-muted-foreground" />}
          nodeData={{
            type: 'file',
            description: 'Summary of the entire academic paper',
            sampleContent: 'This paper examines the effects of...',
            estimatedWords: 300,
            tags: ['abstract', 'summary']
          }}
          searchTerm={searchTerm}
        />
        <TreeNode 
          label="Table of Contents" 
          icon={<FileText className="h-4 w-4 text-muted-foreground" />}
          nodeData={{
            type: 'file',
            description: 'Organized outline of the paper',
            sampleContent: 'I. Introduction\nII. Literature Review\nIII. Methodology\n...',
            estimatedWords: 300,
            tags: ['contents', 'organization']
          }}
          searchTerm={searchTerm}
          isLast={true}
        />
      </TreeNode>
      
      <TreeNode 
        label="Main Content" 
        icon={<Folder className="h-4 w-4 text-primary" />}
        nodeData={{
          type: 'folder',
          description: 'The main body of the academic paper',
          estimatedWords: settings.academicSections * 2000,
          tags: ['content', 'academic']
        }}
        searchTerm={searchTerm}
      >
        <TreeNode 
          label="Introduction" 
          icon={<GraduationCap className="h-4 w-4 text-amber-500" />}
          nodeData={{
            type: 'file',
            description: 'Introduction to the academic paper',
            sampleContent: 'The field of [subject] has seen significant developments in recent years...',
            estimatedWords: 1000,
            tags: ['introduction', 'context']
          }}
          searchTerm={searchTerm}
        />
        <TreeNode 
          label="Literature Review" 
          icon={<GraduationCap className="h-4 w-4 text-amber-500" />}
          nodeData={{
            type: 'file',
            description: 'Review of existing literature',
            sampleContent: 'Previous research by Smith (2023) demonstrated that...',
            estimatedWords: 2000,
            tags: ['literature', 'review']
          }}
          searchTerm={searchTerm}
        />
        
        <TreeNode 
          label="Academic Sections"
          icon={<Folder className="h-4 w-4 text-primary" />}
          nodeData={{
            type: 'folder',
            description: 'Main academic content sections',
            estimatedWords: settings.academicSections * 2000,
            tags: ['sections', 'findings']
          }}
          searchTerm={searchTerm}
        >
          {Array.from({ length: Math.min(settings.academicSections, 5) }).map((_, i) => (
            <TreeNode 
              key={`section-${i}`}
              label={`Section ${i + 1}`}
              icon={<GraduationCap className="h-4 w-4 text-amber-500" />}
              nodeData={{
                type: 'file',
                description: `Academic section ${i + 1}`,
                sampleContent: i === 0 ? 'Analysis of primary findings indicates that...' : undefined,
                estimatedWords: 2000,
                tags: ['academic', 'analysis']
              }}
              searchTerm={searchTerm}
              isLast={i === Math.min(settings.academicSections, 5) - 1 && settings.academicSections <= 5}
            />
          ))}
          {settings.academicSections > 5 && (
            <TreeNode 
              label={`... ${settings.academicSections - 5} more sections`}
              icon={<GraduationCap className="h-4 w-4 text-amber-500/50" />}
              searchTerm={searchTerm}
              isLast={true}
            />
          )}
        </TreeNode>
        
        <TreeNode 
          label="Methodology" 
          icon={<GraduationCap className="h-4 w-4 text-amber-500" />}
          nodeData={{
            type: 'file',
            description: 'Research methodology and approach',
            sampleContent: 'This study employed a mixed-methods approach...',
            estimatedWords: 1500,
            tags: ['methodology', 'methods']
          }}
          searchTerm={searchTerm}
        />
        
        <TreeNode 
          label="Results" 
          icon={<GraduationCap className="h-4 w-4 text-amber-500" />}
          nodeData={{
            type: 'file',
            description: 'Findings from the research',
            sampleContent: 'The results show a significant correlation between...',
            estimatedWords: 2000,
            tags: ['results', 'findings']
          }}
          searchTerm={searchTerm}
        />
        
        <TreeNode 
          label="Discussion" 
          icon={<GraduationCap className="h-4 w-4 text-amber-500" />}
          nodeData={{
            type: 'file',
            description: 'Analysis and interpretation of results',
            sampleContent: 'These findings suggest that...',
            estimatedWords: 2000,
            tags: ['discussion', 'interpretation']
          }}
          searchTerm={searchTerm}
        />
        
        <TreeNode 
          label="Conclusion" 
          icon={<GraduationCap className="h-4 w-4 text-amber-500" />}
          nodeData={{
            type: 'file',
            description: 'Summary and implications',
            sampleContent: 'In conclusion, this research demonstrates...',
            estimatedWords: 1000,
            tags: ['conclusion', 'summary']
          }}
          searchTerm={searchTerm}
          isLast={true}
        />
      </TreeNode>
      
      <TreeNode 
        label="Back Matter" 
        icon={<Folder className="h-4 w-4 text-primary" />}
        nodeData={{
          type: 'folder',
          description: 'References and supporting materials',
          estimatedWords: 1500,
          tags: ['references', 'appendices']
        }}
        searchTerm={searchTerm}
        isLast={true}
      >
        <TreeNode 
          label="References" 
          icon={<FileText className="h-4 w-4 text-violet-500" />}
          nodeData={{
            type: 'file',
            description: 'Bibliography and citations',
            sampleContent: 'Smith, J. (2023). Title of article. Journal Name, 12(3), 45-67.',
            estimatedWords: 1000,
            tags: ['references', 'citations']
          }}
          searchTerm={searchTerm}
        />
        <TreeNode 
          label="Appendices" 
          icon={<FileText className="h-4 w-4 text-violet-500" />}
          nodeData={{
            type: 'file',
            description: 'Supplementary materials',
            sampleContent: 'Appendix A: Survey Questions\nAppendix B: Raw Data Tables',
            estimatedWords: 500,
            tags: ['appendices', 'supplements']
          }}
          searchTerm={searchTerm}
          isLast={true}
        />
      </TreeNode>
    </>
  );
}

function renderMemoirStructure(settings: DocumentStructureSettings, searchTerm: string = '') {
  return (
    <>
      <TreeNode 
        label="Front Matter" 
        icon={<Folder className="h-4 w-4 text-primary" />}
        nodeData={{
          type: 'folder',
          description: 'Contains title page and introductory materials',
          estimatedWords: 700,
          tags: ['metadata', 'introduction']
        }}
        searchTerm={searchTerm}
      >
        <TreeNode 
          label="Title Page" 
          icon={<FileText className="h-4 w-4 text-muted-foreground" />}
          nodeData={{
            type: 'file',
            description: 'The title page for your memoir',
            sampleContent: 'MEMOIR TITLE\n\nBy Author Name\n\n© 2025',
            estimatedWords: 100,
            tags: ['title', 'metadata']
          }}
          searchTerm={searchTerm}
        />
        <TreeNode 
          label="Dedication" 
          icon={<FileText className="h-4 w-4 text-muted-foreground" />}
          nodeData={{
            type: 'file',
            description: 'A dedication to someone important',
            sampleContent: 'For my family, who supported me through...',
            estimatedWords: 100,
            tags: ['dedication', 'personal']
          }}
          searchTerm={searchTerm}
        />
        <TreeNode 
          label="Preface" 
          icon={<FileText className="h-4 w-4 text-muted-foreground" />}
          nodeData={{
            type: 'file',
            description: 'Introduction to the memoir',
            sampleContent: 'This memoir chronicles my journey through...',
            estimatedWords: 500,
            tags: ['preface', 'introduction']
          }}
          searchTerm={searchTerm}
          isLast={true}
        />
      </TreeNode>
      
      <TreeNode 
        label="Memoir Chapters" 
        icon={<Folder className="h-4 w-4 text-primary" />}
        nodeData={{
          type: 'folder',
          description: 'The main content of your memoir',
          estimatedWords: settings.memoirChapters * 3500,
          tags: ['content', 'chapters']
        }}
        searchTerm={searchTerm}
      >
        {Array.from({ length: Math.min(settings.memoirChapters, 5) }).map((_, i) => (
          <TreeNode 
            key={`chapter-${i}`}
            label={`Chapter ${i + 1}`}
            icon={<Book className="h-4 w-4 text-amber-500" />}
            nodeData={{
              type: 'section',
              description: `Chapter ${i + 1} of your memoir`,
              sampleContent: i === 0 ? 'The day everything changed began like any other...' : undefined,
              estimatedWords: 3500,
              tags: ['chapter', 'narrative']
            }}
            searchTerm={searchTerm}
            isLast={i === Math.min(settings.memoirChapters, 5) - 1 && settings.memoirChapters <= 5}
          />
        ))}
        {settings.memoirChapters > 5 && (
          <TreeNode 
            label={`... ${settings.memoirChapters - 5} more chapters`}
            icon={<Book className="h-4 w-4 text-amber-500/50" />}
            searchTerm={searchTerm}
            isLast={true}
          />
        )}
      </TreeNode>
      
      <TreeNode 
        label="Timeline" 
        icon={<Folder className="h-4 w-4 text-primary" />}
        nodeData={{
          type: 'folder',
          description: 'Chronological timeline of events',
          estimatedWords: 1000,
          tags: ['timeline', 'chronology']
        }}
        searchTerm={searchTerm}
      >
        <TreeNode 
          label="Key Events" 
          icon={<CalendarDays className="h-4 w-4 text-sky-500" />}
          nodeData={{
            type: 'file',
            description: 'Timeline of significant events',
            sampleContent: '1985: Born in small town\n1995: Family moved to the city\n2005: College graduation',
            estimatedWords: 1000,
            tags: ['events', 'dates']
          }}
          searchTerm={searchTerm}
          isLast={true}
        />
      </TreeNode>
      
      <TreeNode 
        label="People" 
        icon={<Folder className="h-4 w-4 text-primary" />}
        nodeData={{
          type: 'folder',
          description: 'Important people in the memoir',
          estimatedWords: 1500,
          tags: ['people', 'relationships']
        }}
        searchTerm={searchTerm}
      >
        <TreeNode 
          label="Character List" 
          icon={<Users className="h-4 w-4 text-violet-500" />}
          nodeData={{
            type: 'file',
            description: 'List of people in the memoir',
            sampleContent: 'Mother: Strong-willed and supportive\nFather: Quiet but influential\nBest Friend: Loyal companion through difficult times',
            estimatedWords: 1500,
            tags: ['characters', 'relationships']
          }}
          searchTerm={searchTerm}
          isLast={true}
        />
      </TreeNode>
      
      <TreeNode 
        label="Places" 
        icon={<Folder className="h-4 w-4 text-primary" />}
        nodeData={{
          type: 'folder',
          description: 'Important locations in the memoir',
          estimatedWords: 1200,
          tags: ['places', 'settings']
        }}
        searchTerm={searchTerm}
        isLast={true}
      >
        <TreeNode 
          label="Location Notes" 
          icon={<Map className="h-4 w-4 text-emerald-500" />}
          nodeData={{
            type: 'file',
            description: 'Details of significant places',
            sampleContent: 'Childhood Home: A small house with a large backyard\nCollege Campus: Where independence was gained\nFirst Apartment: Where adult life truly began',
            estimatedWords: 1200,
            tags: ['locations', 'settings']
          }}
          searchTerm={searchTerm}
          isLast={true}
        />
      </TreeNode>
    </>
  );
}

function renderNonfictionStructure(settings: DocumentStructureSettings, searchTerm: string = '') {
  return (
    <>
      <TreeNode 
        label="Front Matter" 
        icon={<Folder className="h-4 w-4 text-primary" />}
        nodeData={{
          type: 'folder',
          description: 'Contains title page, table of contents, and preface',
          estimatedWords: 1500,
          tags: ['metadata', 'introduction']
        }}
        searchTerm={searchTerm}
      >
        <TreeNode 
          label="Title Page" 
          icon={<FileText className="h-4 w-4 text-muted-foreground" />}
          nodeData={{
            type: 'file',
            description: 'The title page for your nonfiction book',
            sampleContent: 'NONFICTION TITLE\n\nBy Author Name\n\n© 2025',
            estimatedWords: 100,
            tags: ['title', 'metadata']
          }}
          searchTerm={searchTerm}
        />
        <TreeNode 
          label="Table of Contents" 
          icon={<FileText className="h-4 w-4 text-muted-foreground" />}
          nodeData={{
            type: 'file',
            description: 'The table of contents',
            sampleContent: 'Chapter 1: Introduction\nChapter 2: Background\nChapter 3: Main Concepts\n...',
            estimatedWords: 400,
            tags: ['toc', 'organization']
          }}
          searchTerm={searchTerm}
        />
        <TreeNode 
          label="Preface" 
          icon={<FileText className="h-4 w-4 text-muted-foreground" />}
          nodeData={{
            type: 'file',
            description: 'Introduction to the nonfiction book',
            sampleContent: 'This book aims to explore the fascinating topic of...',
            estimatedWords: 1000,
            tags: ['preface', 'introduction']
          }}
          searchTerm={searchTerm}
          isLast={true}
        />
      </TreeNode>
      
      <TreeNode 
        label="Main Content" 
        icon={<Folder className="h-4 w-4 text-primary" />}
        nodeData={{
          type: 'folder',
          description: 'The main content of your nonfiction book',
          estimatedWords: settings.nonfictionSections * 4000,
          tags: ['content', 'sections']
        }}
        searchTerm={searchTerm}
      >
        {Array.from({ length: Math.min(settings.nonfictionSections, 5) }).map((_, i) => (
          <TreeNode 
            key={`section-${i}`}
            label={`Section ${i + 1}`}
            icon={<BookText className="h-4 w-4 text-blue-500" />}
            nodeData={{
              type: 'section',
              description: `Section ${i + 1} of your nonfiction book`,
              sampleContent: i === 0 ? 'The foundations of this subject begin with...' : undefined,
              estimatedWords: 4000,
              tags: ['section', 'content']
            }}
            searchTerm={searchTerm}
            isLast={i === Math.min(settings.nonfictionSections, 5) - 1 && settings.nonfictionSections <= 5}
          />
        ))}
        {settings.nonfictionSections > 5 && (
          <TreeNode 
            label={`... ${settings.nonfictionSections - 5} more sections`}
            icon={<BookText className="h-4 w-4 text-blue-500/50" />}
            searchTerm={searchTerm}
            isLast={true}
          />
        )}
      </TreeNode>
      
      <TreeNode 
        label="Research" 
        icon={<Folder className="h-4 w-4 text-primary" />}
        nodeData={{
          type: 'folder',
          description: 'Research materials and notes',
          estimatedWords: 3000,
          tags: ['research', 'references']
        }}
        searchTerm={searchTerm}
      >
        <TreeNode 
          label="Sources" 
          icon={<FileText className="h-4 w-4 text-muted-foreground" />}
          nodeData={{
            type: 'file',
            description: 'Source materials and citations',
            sampleContent: 'Primary Sources:\n- Interview with Expert A\n- Original research data\n\nSecondary Sources:\n- Smith, J. (2022). The Complete Guide.\n- Johnson, M. (2021). Advanced Concepts.',
            estimatedWords: 1500,
            tags: ['sources', 'citations']
          }}
          searchTerm={searchTerm}
        />
        <TreeNode 
          label="Reference Notes" 
          icon={<FileText className="h-4 w-4 text-muted-foreground" />}
          nodeData={{
            type: 'file',
            description: 'Detailed notes on references',
            sampleContent: 'Notes on Smith (2022):\n- Key concepts on pages 45-52\n- Methodology questions on approach',
            estimatedWords: 1500,
            tags: ['notes', 'references']
          }}
          searchTerm={searchTerm}
          isLast={true}
        />
      </TreeNode>
      
      <TreeNode 
        label="Appendices" 
        icon={<Folder className="h-4 w-4 text-primary" />}
        nodeData={{
          type: 'folder',
          description: 'Additional materials and references',
          estimatedWords: 2000,
          tags: ['appendix', 'supplements']
        }}
        searchTerm={searchTerm}
      >
        <TreeNode 
          label="Glossary" 
          icon={<FileText className="h-4 w-4 text-muted-foreground" />}
          nodeData={{
            type: 'file',
            description: 'Definitions of key terms',
            sampleContent: 'Term 1: Definition of the first important concept\nTerm 2: Definition of the second important concept',
            estimatedWords: 1000,
            tags: ['glossary', 'definitions']
          }}
          searchTerm={searchTerm}
        />
        <TreeNode 
          label="Index" 
          icon={<FileText className="h-4 w-4 text-muted-foreground" />}
          nodeData={{
            type: 'file',
            description: 'Alphabetical index of topics',
            sampleContent: 'A\nAcademic standards, 45\nAccreditation, 72\n\nB\nBest practices, 23\nBibliography, 112',
            estimatedWords: 1000,
            tags: ['index', 'reference']
          }}
          searchTerm={searchTerm}
          isLast={true}
        />
      </TreeNode>
      
      <TreeNode 
        label="Bibliography" 
        icon={<Folder className="h-4 w-4 text-primary" />}
        nodeData={{
          type: 'folder',
          description: 'Complete list of references',
          estimatedWords: 1500,
          tags: ['bibliography', 'references']
        }}
        searchTerm={searchTerm}
        isLast={true}
      >
        <TreeNode 
          label="References" 
          icon={<FileText className="h-4 w-4 text-muted-foreground" />}
          nodeData={{
            type: 'file',
            description: 'Complete bibliography in proper citation format',
            sampleContent: 'Adams, J. (2020). The Definitive Guide. New York: Academic Press.\n\nBrown, S. & Johnson, T. (2021). Advanced Theory and Practice. Journal of Important Studies, 45(2), 112-128.',
            estimatedWords: 1500,
            tags: ['references', 'citations']
          }}
          searchTerm={searchTerm}
          isLast={true}
        />
      </TreeNode>
    </>
  );
}

export default DocumentTreeVisualizer;
