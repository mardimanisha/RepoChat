import { Card } from '../ui/card';
import MessageInput from './MessageInput';
import RepositoryInput from '../repository/RepositoryInput';
import { useRepository } from '@/hooks/useRepository';
import { useChat } from '@/hooks/useChat';
import RepositoryStatus from '../repository/RepositoryStatus';
import { MessageList } from './MessageList';
import { useAutoScroll } from '@/hooks/useAutoScroll';



export default function ChatInterface() {

  // Initialize hooks
  const {
    repositoryState,
    setRepoUrl,
    loadRepository,
    isValidUrl,
    canLoadRepo
  } = useRepository((welcomeMessage) => {
    setMessages([welcomeMessage]);
  });

  const {
    chatState,
    setMessages,
    setInputMessage,
    sendMessage,
    canSendMessage
  } = useChat(repositoryState.url);

  const scrollAreaRef = useAutoScroll(chatState.messages);

  return (
    <div className="flex flex-col h-full">
      {/* Repository Input Section */}
      {!repositoryState.isLoaded && (
        <RepositoryInput
        repoUrl={repositoryState.url}
          isLoading={repositoryState.isLoading}
          isValidUrl={isValidUrl}
          canLoadRepo={canLoadRepo}
          onRepoUrlChange={setRepoUrl}
          onLoadRepo={loadRepository}
      />
      )}
      
      
      {/* Repository Status */}
      {repositoryState.isLoaded && (
        <RepositoryStatus repoUrl={repositoryState.url} />
      )}
      

      {/* Chat Interface */}
      <Card className="flex-1 flex flex-col">
        <MessageList 
          ref={scrollAreaRef}
          messages={chatState.messages}
          isResponding={chatState.isResponding}
        />

        {/* Message Input */}
        {repositoryState.isLoaded && (
          <MessageInput
            inputMessage={chatState.inputMessage}
            canSendMessage={canSendMessage}
            onInputChange={setInputMessage}
            onSendMessage={sendMessage}
          />
        )}
      </Card>
    </div>
  );
}