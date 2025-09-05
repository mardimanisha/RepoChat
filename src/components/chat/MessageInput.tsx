import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Send } from 'lucide-react';

export default function MessageInput() {

  return (
    <div className="p-4 border-t">
      <div className="flex gap-2">
        <Textarea
          placeholder="Ask me anything about this repository..."
          className="flex-1 min-h-[2.5rem] max-h-32 resize-none"
          rows={1}
        />
        <Button
          size="icon"
          className="self-end"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}