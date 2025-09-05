import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Github, Loader2 } from 'lucide-react';
import { VALIDATION_MESSAGES } from '../../constants'

interface RepositoryInputProps {
    repoUrl: string;
    isLoading: boolean;
    isValidUrl: boolean;
    canLoadRepo: boolean;
    onRepoUrlChange: (url: string) => void;
    onLoadRepo: () => void;
}


export default function RepositoryInput({
  repoUrl,
  isLoading,
  isValidUrl,
  canLoadRepo,
  onRepoUrlChange,
  onLoadRepo
}: RepositoryInputProps) {
  return (
    <Card className="p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
            <Github className="h-5 w-5" />
            <h2>GitHub Repository</h2>
        </div>
        <div className="flex gap-2">
            <Input
                placeholder="https://github.com/owner/repository"
                value={repoUrl}
                onChange={(e) => onRepoUrlChange(e.target.value)}
                className="flex-1"
            />
              
            <Button
                onClick={onLoadRepo}
                disabled={!canLoadRepo}
            >
                {isLoading ? (
                    <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Loading...
                    </>
                ) : (
                    'Load Repository'
                )}
            </Button>
        </div>
          {repoUrl && !isValidUrl && (
              <p className="text-sm text-muted-foreground mt-2">
                    {VALIDATION_MESSAGES.INVALID_URL}
              </p>
          )}
    </Card>
  );
}