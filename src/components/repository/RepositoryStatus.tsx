import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { CheckCircle2 } from 'lucide-react';
import { formatRepositoryName } from '../../utils/validationUtils';

interface RepositoryStatusProps {
  repoUrl: string;
}

export default function RepositoryStatus({ repoUrl }: RepositoryStatusProps) {
  return (
    <Card className="p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <span className="font-medium">Repository Loaded</span>
        </div>
        <Badge variant="secondary" className="text-xs">
          {formatRepositoryName(repoUrl)}
        </Badge>
      </div>
    </Card>
  );
}