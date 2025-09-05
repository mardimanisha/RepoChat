import { Card } from '../ui/card';
import { Loader2 } from 'lucide-react';

export function ThinkingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
        <Loader2 className="h-4 w-4 text-primary-foreground animate-spin" />
      </div>
      <Card className="p-3">
        <div className="text-muted-foreground">Thinking...</div>
      </Card>
    </div>
  );
}