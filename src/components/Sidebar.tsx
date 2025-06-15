
import { Book, Users, GitMerge, Globe, Link as LinkIcon, Bot, List, Layers, Plus, Search, Settings } from 'lucide-react';
import { useWriting } from '@/contexts/WritingContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Sidebar = () => {
  const { state, dispatch } = useWriting();

  const navItems = [
    { name: 'Story', icon: Book, section: 'story' as const },
    { name: 'Outline', icon: List, section: 'outline' as const },
    { name: 'Story Structure', icon: Layers, section: 'story-structure' as const },
    { name: 'Characters', icon: Users, section: 'characters' as const },
    { name: 'Story Arc', icon: GitMerge, section: 'story-arc' as const },
    { name: 'World Building', icon: Globe, section: 'world-building' as const },
    { name: 'Cross-References', icon: LinkIcon, section: 'cross-references' as const },
  ];

  const aiItems = [
    { name: 'AI Assistance', icon: Bot, section: 'ai-assistance' as const },
  ];

  const handleSectionChange = (section: typeof state.activeSection) => {
    dispatch({ type: 'SET_ACTIVE_SECTION', payload: section });
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
        {/* Writing Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-primary/20"></div>
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Writing
              </h2>
            </div>
          </div>
          <ul className="space-y-1">
            {navItems.map((item) => {
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

        {/* AI Section */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-violet-500/20"></div>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              AI & ML
            </h2>
          </div>
          <ul className="space-y-1">
            {aiItems.map((item) => (
              <li key={item.name}>
                <button
                  onClick={() => handleSectionChange(item.section)}
                  className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 group ${
                    state.activeSection === item.section
                      ? 'bg-violet-500 text-white shadow-md scale-105 border-2 border-violet-500/30' 
                      : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground border border-transparent hover:scale-102'
                  }`}
                >
                  <item.icon className={`h-5 w-5 mr-3 transition-colors ${
                    state.activeSection === item.section ? 'text-white' : 'text-muted-foreground group-hover:text-accent-foreground'
                  }`} />
                  <span className="font-medium">{item.name}</span>
                  {state.activeSection === item.section && (
                    <div className="ml-auto w-2 h-2 rounded-full bg-white"></div>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>      {/* Footer */}
      <div className="mt-auto pt-6 border-t border-border/20 space-y-3">
        <Button variant="ghost" size="sm" className="w-full justify-start">
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
