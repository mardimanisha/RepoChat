import { forwardRef } from 'react';
import { ScrollArea } from '../ui/scroll-area';
import { ChatMessage } from './ChatMessage';
import type { Message } from '../../types';
import { ThinkingIndicator } from './ThinkingIndicator';

interface MessageListProps {
  messages: Message[];
  isResponding: boolean;
}

export const MessageList = forwardRef<HTMLDivElement, MessageListProps>(
  ({ messages, isResponding }, ref) => {
    return (
      <ScrollArea className="flex-1 p-4" ref={ref}>
        <div className="space-y-4">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              type={message.type}
              content={message.content}
              citations={message.citations}
              timestamp={message.timestamp}
            />
          ))}
          {isResponding && <ThinkingIndicator />}
        </div>
      </ScrollArea>
    );
  }
);

MessageList.displayName = 'MessageList';