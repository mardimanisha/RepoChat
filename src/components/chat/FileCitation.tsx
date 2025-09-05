import { FileText, ExternalLink } from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';

interface FileCitationProps {
  filename: string;
  content: string;
  lineStart?: number;
  lineEnd?: number;
  url?: string;
}

export function FileCitation({ filename, content, lineStart, lineEnd, url }: FileCitationProps) {
  const lines = content.split('\n');
  const displayLines = lineStart && lineEnd 
    ? lines.slice(lineStart - 1, lineEnd)
    : lines.slice(0, 10); // Show first 10 lines if no range specified

  return (
    <Card className="mt-3 border-l-4 border-l-primary">
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{filename}</span>
            {lineStart && lineEnd && (
              <Badge variant="secondary" className="text-xs">
                Lines {lineStart}-{lineEnd}
              </Badge>
            )}
          </div>
          {url && (
            <button
              onClick={() => window.open(url, '_blank')}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="bg-muted rounded-md p-3 font-mono text-sm overflow-x-auto">
          <pre className="whitespace-pre-wrap">
            {displayLines.map((line, index) => (
              <div key={index} className="flex">
                <span className="text-muted-foreground mr-3 select-none min-w-[2rem] text-right">
                  {(lineStart || 1) + index}
                </span>
                <span>{line}</span>
              </div>
            ))}
          </pre>
        </div>
      </div>
    </Card>
  );
}