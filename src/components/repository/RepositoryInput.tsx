import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Github } from 'lucide-react';


export default function RepositoryInput() {
  return (
    <Card className="p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Github className="h-5 w-5" />
        <h2>GitHub Repository</h2>
      </div>
      <div className="flex gap-2">
        <Input
          placeholder="https://github.com/owner/repository"
          className="flex-1"
        />
        <Button variant='secondary'>Load Repository</Button>
            
      </div>
    </Card>
  );
}