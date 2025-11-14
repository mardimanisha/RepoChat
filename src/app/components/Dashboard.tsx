import { useState, useEffect } from "react";
import { ChatSidebar } from "./ChatSidebar";
import { ChatWindow } from "./ChatWindow";
import { RepoInput } from "./RepoInput";
import { projectId, publicAnonKey } from "../../utils/supabase/info";

interface DashboardProps {
  supabase: any;
  session: any;
  theme: "light" | "dark";
  toggleTheme: () => void;
}

export function Dashboard({ supabase, session, theme, toggleTheme }: DashboardProps) {
  const [chats, setChats] = useState<any[]>([]);
  const [repos, setRepos] = useState<any[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChats();
    loadRepos();
  }, []);

  const loadChats = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-1003346e/chat/list`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      const data = await response.json();
      setChats(data.chats || []);
      setLoading(false);
    } catch (error) {
      console.error("Error loading chats:", error);
      setLoading(false);
    }
  };

  const loadRepos = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-1003346e/repo/list`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      const data = await response.json();
      setRepos(data.repos || []);
    } catch (error) {
      console.error("Error loading repos:", error);
    }
  };

  const handleNewChat = async (repoId: string, repoName: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-1003346e/chat/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            repoId,
            title: `Chat about ${repoName}`,
          }),
        }
      );

      const data = await response.json();
      
      if (data.chatId) {
        await loadChats();
        setCurrentChatId(data.chatId);
      }
    } catch (error) {
      console.error("Error creating chat:", error);
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-1003346e/chat/${chatId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (response.ok) {
        setChats(chats.filter(chat => chat.id !== chatId));
        if (currentChatId === chatId) {
          setCurrentChatId(null);
        }
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const currentChat = chats.find(chat => chat.id === currentChatId);
  const currentRepo = currentChat ? repos.find(repo => repo.id === currentChat.repoId) : null;

  return (
    <div className={`flex h-screen ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'}`}>
      {/* Sidebar */}
      <ChatSidebar
        chats={chats}
        currentChatId={currentChatId}
        onSelectChat={setCurrentChatId}
        onDeleteChat={handleDeleteChat}
        onNewChat={() => setCurrentChatId(null)}
        onSignOut={handleSignOut}
        theme={theme}
        toggleTheme={toggleTheme}
        userName={session.user?.user_metadata?.name || session.user?.email}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {currentChatId && currentRepo ? (
          <ChatWindow
            chatId={currentChatId}
            repo={currentRepo}
            session={session}
            theme={theme}
          />
        ) : (
          <RepoInput
            repos={repos}
            session={session}
            onRepoIngested={loadRepos}
            onStartChat={handleNewChat}
            theme={theme}
          />
        )}
      </div>
    </div>
  );
}
