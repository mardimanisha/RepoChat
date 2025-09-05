import { useTheme } from '@/providers/ThemeProvider';
import { Moon, Sun, Github, MessageSquare } from 'lucide-react';
import { Button } from '../ui/button';

export function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="fixed top-0 left-0 right-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/10">
            <Github className="h-5 w-5 text-primary" />
            <MessageSquare className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-semibold">RepoChat</h1>
            <p className="text-xs text-muted-foreground">Chat with GitHub repositories</p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="rounded-full"
        >
          {theme === 'light' ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
        </Button>
      </div>
    </header>
  );
}