import { Card } from '../ui/card';
//import MessageList from './MessageList';
import MessageInput from './MessageInput';
import RepositoryInput from '../repository/RepositoryInput';
//import RepositoryStatus from '../repository/RepositoryStatus';

export default function ChatInterface() {

  return (
    <div className="flex flex-col h-full">
      {/* Repository Input Section */}
       <RepositoryInput/>
      
      
      {/* Repository Status 
      <RepositoryStatus />*/}
      

      {/* Chat Interface */}
      <Card className="flex-1 flex flex-col">
        {/* <MessageList /> */}

        {/* Message Input */}
          <MessageInput/>
      </Card>
    </div>
  );
}