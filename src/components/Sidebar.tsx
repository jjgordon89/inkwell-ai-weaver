
import { Book, Users, GitMerge, Globe, Link as LinkIcon, Bot, List, Layers } from 'lucide-react';
import { useWriting } from '@/contexts/WritingContext';

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

  return (
    <div className="h-full bg-card/30 p-6 flex flex-col border-r border-border/50">
      {/* Header Section */}
      <div className="mb-8 pb-6 border-b border-border/20">
        <h1 className="text-2xl font-bold text-foreground mb-1">Manuscript</h1>
        <p className="text-sm text-muted-foreground">AI Writing Assistant</p>
      </div>

      {/* Navigation */}
      <nav className="flex-grow space-y-8">
        {/* Writing Section */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-primary/20"></div>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Writing
            </h2>
          </div>
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.name}>
                <button
                  onClick={() => handleSectionChange(item.section)}
                  className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 group ${
                    state.activeSection === item.section
                      ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm' 
                      : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground border border-transparent'
                  }`}
                >
                  <item.icon className={`h-5 w-5 mr-3 transition-colors ${
                    state.activeSection === item.section ? 'text-primary' : 'text-muted-foreground group-hover:text-accent-foreground'
                  }`} />
                  <span className="font-medium">{item.name}</span>
                </button>
              </li>
            ))}
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
                      ? 'bg-violet-500/10 text-violet-600 border border-violet-500/20 shadow-sm' 
                      : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground border border-transparent'
                  }`}
                >
                  <item.icon className={`h-5 w-5 mr-3 transition-colors ${
                    state.activeSection === item.section ? 'text-violet-600' : 'text-muted-foreground group-hover:text-accent-foreground'
                  }`} />
                  <span className="font-medium">{item.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Footer */}
      <div className="mt-auto pt-6 border-t border-border/20">
        <p className="text-xs text-muted-foreground">&copy; 2025 Lovable</p>
      </div>
    </div>
  );
};

export default Sidebar;
