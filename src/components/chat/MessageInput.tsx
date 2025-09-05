import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Send } from 'lucide-react';

interface MessageInputProps {
  inputMessage: string;
  canSendMessage: boolean | string;  // Updated type to match what useChat provides
  onInputChange: (message: string) => void;
  onSendMessage: () => Promise<void>;
}

export default function MessageInput({ inputMessage, canSendMessage, onInputChange, onSendMessage }: MessageInputProps) {
  return (
    <div className="p-4 border-t">
      <div className="flex gap-2">
        <Textarea
          placeholder="Ask me anything about this repository..."
          className="flex-1 min-h-[2.5rem] max-h-32 resize-none"
          rows={1}
          value={inputMessage}
          onChange={(e) => onInputChange(e.target.value)}
        />
        <Button 
          size="icon"
          className="self-end"
          onClick={onSendMessage}
          disabled={!Boolean(canSendMessage)}  // Convert to boolean explicitly
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}