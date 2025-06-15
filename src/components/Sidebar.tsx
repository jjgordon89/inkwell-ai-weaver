
import { Book, Users, GitMerge, Globe, Link as LinkIcon, Bot, List, Layers } from 'lucide-react';
import { useWriting } from '@/contexts/WritingContext';
import { cn } from '@/lib/utils';

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
    <div className="h-full bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 flex flex-col border-r border-slate-200 dark:border-slate-800">
      {/* Header */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Book className="h-4 w-4 text-white" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
            Manuscript
          </h1>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400">AI Writing Assistant</p>
      </div>

      {/* Navigation */}
      <nav className="flex-grow p-4 space-y-6">
        {/* Writing Section */}
        <div>
          <h2 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 px-2">
            Writing
          </h2>
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = state.activeSection === item.section;
              return (
                <li key={item.name}>
                  <button
                    onClick={() => handleSectionChange(item.section)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                      isActive
                        ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-700 dark:text-blue-300 shadow-sm"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100"
                    )}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-r-full" />
                    )}
                    <item.icon className={cn(
                      "h-5 w-5 transition-colors duration-200",
                      isActive 
                        ? "text-blue-600 dark:text-blue-400" 
                        : "text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300"
                    )} />
                    <span className={cn(
                      "font-medium transition-colors duration-200",
                      isActive && "font-semibold"
                    )}>
                      {item.name}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* AI Section */}
        <div>
          <h2 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 px-2 pt-4 border-t border-slate-200 dark:border-slate-800">
            AI & ML
          </h2>
          <ul className="space-y-1">
            {aiItems.map((item) => {
              const isActive = state.activeSection === item.section;
              return (
                <li key={item.name}>
                  <button
                    onClick={() => handleSectionChange(item.section)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                      isActive
                        ? "bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-700 dark:text-emerald-300 shadow-sm"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100"
                    )}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-r-full" />
                    )}
                    <item.icon className={cn(
                      "h-5 w-5 transition-colors duration-200",
                      isActive 
                        ? "text-emerald-600 dark:text-emerald-400" 
                        : "text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300"
                    )} />
                    <span className={cn(
                      "font-medium transition-colors duration-200",
                      isActive && "font-semibold"
                    )}>
                      {item.name}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
          &copy; 2025 Lovable
        </p>
      </div>
    </div>
  );
};

export default Sidebar;
