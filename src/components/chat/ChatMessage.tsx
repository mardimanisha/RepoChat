import { Card } from '../ui/card';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { FileCitation } from './FileCitation';
import { User, Bot } from 'lucide-react';
import type { Citation } from '../../types';

interface ChatMessageProps {
  type: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  timestamp: Date;
}

export function ChatMessage({ type, content, citations, timestamp }: ChatMessageProps) {
  return (
    <div className={`flex gap-3 ${type === 'user' ? 'justify-end' : 'justify-start'}`}>
      {type === 'assistant' && (
        <Avatar className="w-8 h-8 mt-1">
          <AvatarFallback className="bg-primary text-primary-foreground">
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={`max-w-[80%] ${type === 'user' ? 'order-1' : ''}`}>
        <Card className={`p-3 ${type === 'user' ? 'bg-primary text-primary-foreground ml-auto' : 'bg-card'}`}>
          <div className="whitespace-pre-wrap">{content}</div>
        </Card>
        
        {citations && citations.length > 0 && (
          <div className="space-y-2">
            {citations.map((citation, index) => (
              <FileCitation
                key={`${citation.filename}-${index}`}
                filename={citation.filename}
                content={citation.content}
                lineStart={citation.lineStart}
                lineEnd={citation.lineEnd}
                url={citation.url}
              />
            ))}
          </div>
        )}
        
        <div className={`text-xs text-muted-foreground mt-1 ${type === 'user' ? 'text-right' : ''}`}>
          {timestamp.toLocaleTimeString()}
        </div>
      </div>
      
      {type === 'user' && (
        <Avatar className="w-8 h-8 mt-1">
          <AvatarFallback className="bg-secondary text-secondary-foreground">
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}