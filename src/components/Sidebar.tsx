
import { Book, Users, GitMerge, Globe, Link as LinkIcon, Bot } from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { name: 'Story', icon: Book, active: true },
    { name: 'Characters', icon: Users, active: false },
    { name: 'Story Arc', icon: GitMerge, active: false },
    { name: 'World Building', icon: Globe, active: false },
    { name: 'Cross-References', icon: LinkIcon, active: false },
  ];

  const aiItems = [
      { name: 'AI Assistance', icon: Bot, active: false },
  ]

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
              <a
                href="#"
                className={`flex items-center p-2 rounded-md transition-colors ${
                  item.active 
                    ? 'bg-primary/10 text-primary font-semibold' 
                    : 'text-foreground/70 hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <item.icon className="h-5 w-5 mr-3" />
                <span>{item.name}</span>
              </a>
            </li>
          ))}
        </ul>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider my-3 pt-4 mt-8 border-t">
          AI & ML
        </h2>
        <ul>
            {aiItems.map((item) => (
                <li key={item.name}>
                <a
                    href="#"
                    className="flex items-center p-2 rounded-md text-foreground/70 hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                    <item.icon className="h-5 w-5 mr-3" />
                    <span>{item.name}</span>
                </a>
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
