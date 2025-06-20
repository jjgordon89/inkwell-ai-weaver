
import { Book, Users, GitMerge, Globe, Link as LinkIcon, Bot, List, Layers, Plus, Search, Settings, Folder, Pen, Sparkles, Wrench } from 'lucide-react';
import { useWriting } from '@/contexts/WritingContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from 'react-router-dom';
import AISettingsMenu from './ai/AISettingsMenu';

type NavItem = {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  section: string;
};

const Sidebar = () => {
  const { state, dispatch } = useWriting();

  const projectItems = [
    { name: 'All Projects', icon: Folder, path: '/projects' },
  ];

  const writingItems: NavItem[] = [
    { name: 'Story', icon: Book, section: 'story' },
    { name: 'Outline', icon: List, section: 'outline' },
    { name: 'Story Structure', icon: Layers, section: 'story-structure' },
  ];

  const storyElementsItems: NavItem[] = [
    { name: 'Characters', icon: Users, section: 'characters' },
    { name: 'Story Arcs', icon: GitMerge, section: 'story-arc' },
    { name: 'World Building', icon: Globe, section: 'world-building' },
  ];

  const toolsItems: NavItem[] = [
    { name: 'AI Assistance', icon: Bot, section: 'ai-assistance' },
    { name: 'Cross-References', icon: LinkIcon, section: 'cross-references' },
  ];

  const handleSectionChange = (section: string) => {
    dispatch({ type: 'SET_ACTIVE_SECTION', payload: section as any });
  };

  const getQuickAction = (section: string) => {
    switch (section) {
      case 'characters':
        return () => console.log('Add character');
      case 'story-arc':
        return () => console.log('Add story arc');
      case 'world-building':
        return () => console.log('Add world element');
      default:
        return null;
    }
  };

  const renderNavSection = (title: string, items: NavItem[], color: string, icon: React.ReactNode) => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <div className={`w-3 h-3 rounded-full ${color}`}></div>
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {title}
          </h2>
        </div>
      </div>
      <ul className="space-y-1">
        {items.map((item) => {
          const quickAction = getQuickAction(item.section);
          return (
            <li key={item.name} className="group">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleSectionChange(item.section)}
                  className={`flex-1 flex items-center p-3 rounded-lg transition-all duration-200 ${
                    state.activeSection === item.section
                      ? 'bg-primary text-primary-foreground shadow-md scale-105 border-2 border-primary/30' 
                      : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground border border-transparent hover:scale-102'
                  }`}
                >
                  <item.icon className={`h-5 w-5 mr-3 transition-colors ${
                    state.activeSection === item.section ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-accent-foreground'
                  }`} />
                  <span className="font-medium">{item.name}</span>
                  {state.activeSection === item.section && (
                    <div className="ml-auto w-2 h-2 rounded-full bg-primary-foreground"></div>
                  )}
                </button>
                {quickAction && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                    onClick={quickAction}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );

  return (
    <div className="h-full bg-card/30 p-6 flex flex-col border-r border-border/50">
      {/* Header Section */}
      <div className="mb-8 pb-6 border-b border-border/20">
        <h1 className="text-2xl font-bold text-foreground mb-1">Manuscript</h1>
        <p className="text-sm text-muted-foreground">AI Writing Assistant</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search sections..."
            className="pl-10 h-9 bg-background/50 border-border/50"
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-grow space-y-8">
        {/* Projects Section */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-green-500/20"></div>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Projects
            </h2>
          </div>
          <ul className="space-y-1">
            {projectItems.map((item) => (
              <li key={item.name}>
                <Link to={item.path} className="block">
                  <button
                    className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 group text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground border border-transparent hover:scale-102`}
                  >
                    <item.icon className={`h-5 w-5 mr-3 transition-colors text-muted-foreground group-hover:text-accent-foreground`} />
                    <span className="font-medium">{item.name}</span>
                  </button>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Writing Section */}
        {renderNavSection('Writing', writingItems, 'bg-blue-500/20', <Pen className="h-4 w-4" />)}

        {/* Story Elements Section */}
        {renderNavSection('Story Elements', storyElementsItems, 'bg-purple-500/20', <Sparkles className="h-4 w-4" />)}

        {/* Tools Section */}
        {renderNavSection('Tools', toolsItems, 'bg-orange-500/20', <Wrench className="h-4 w-4" />)}
      </nav>

      {/* Footer */}
      <div className="mt-auto pt-6 border-t border-border/20 space-y-3">
        <AISettingsMenu />
      </div>
    </div>
  );
};

export default Sidebar;
