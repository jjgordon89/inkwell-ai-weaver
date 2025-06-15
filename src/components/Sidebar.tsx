
import { Book, Users, GitMerge, Globe, Link as LinkIcon, Bot } from 'lucide-react';
import { useWriting } from '@/contexts/WritingContext';

const Sidebar = () => {
  const { state, dispatch } = useWriting();

  const navItems = [
    { name: 'Story', icon: Book, section: 'story' as const },
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
    <div className="h-full bg-muted/50 p-4 flex flex-col border-r">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Manuscript</h1>
        <p className="text-sm text-muted-foreground">AI Writing Assistant</p>
      </div>
      <nav className="flex-grow">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Writing
        </h2>
        <ul>
          {navItems.map((item) => (
            <li key={item.name}>
              <button
                onClick={() => handleSectionChange(item.section)}
                className={`w-full flex items-center p-2 rounded-md transition-colors ${
                  state.activeSection === item.section
                    ? 'bg-primary/10 text-primary font-semibold' 
                    : 'text-foreground/70 hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <item.icon className="h-5 w-5 mr-3" />
                <span>{item.name}</span>
              </button>
            </li>
          ))}
        </ul>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider my-3 pt-4 mt-8 border-t">
          AI & ML
        </h2>
        <ul>
          {aiItems.map((item) => (
            <li key={item.name}>
              <button
                onClick={() => handleSectionChange(item.section)}
                className={`w-full flex items-center p-2 rounded-md transition-colors ${
                  state.activeSection === item.section
                    ? 'bg-primary/10 text-primary font-semibold' 
                    : 'text-foreground/70 hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <item.icon className="h-5 w-5 mr-3" />
                <span>{item.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-auto">
        <p className="text-xs text-muted-foreground">&copy; 2025 Lovable</p>
      </div>
    </div>
  );
};

export default Sidebar;
