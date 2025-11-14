import { Plus, MessageSquare, Trash2, LogOut, Moon, Sun, Github } from "lucide-react";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";

interface ChatSidebarProps {
  chats: any[];
  currentChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  onNewChat: () => void;
  onSignOut: () => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
  userName: string;
}

export function ChatSidebar({
  chats,
  currentChatId,
  onSelectChat,
  onDeleteChat,
  onNewChat,
  onSignOut,
  theme,
  toggleTheme,
  userName,
}: ChatSidebarProps) {
  return (
    <div
      className={`w-64 flex flex-col ${
        theme === "dark"
          ? "bg-slate-950 border-slate-800"
          : "bg-white border-slate-200"
      } border-r`}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-2 mb-4">
          <Github className="w-6 h-6 text-purple-400" />
          <span
            className={`text-xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent`}
          >
            RepoChat
          </span>
        </div>
        <Button
          onClick={onNewChat}
          className={`w-full ${
            theme === "dark"
              ? "bg-white/5 hover:bg-white/10 text-white border-white/10"
              : "bg-slate-100 hover:bg-slate-200 text-slate-900"
          } border backdrop-blur-sm`}
          variant="outline"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </Button>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1 p-2">
        <div className="space-y-1">
          {chats.length === 0 ? (
            <div className="text-center py-8 px-4">
              <MessageSquare
                className={`w-12 h-12 mx-auto mb-2 ${
                  theme === "dark" ? "text-slate-700" : "text-slate-300"
                }`}
              />
              <p
                className={`text-sm ${
                  theme === "dark" ? "text-slate-500" : "text-slate-400"
                }`}
              >
                No chats yet. Start by adding a repository!
              </p>
            </div>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.id}
                className={`group relative rounded-lg transition-colors ${
                  currentChatId === chat.id
                    ? theme === "dark"
                      ? "bg-white/10"
                      : "bg-slate-200"
                    : theme === "dark"
                    ? "hover:bg-white/5"
                    : "hover:bg-slate-100"
                }`}
              >
                <button
                  onClick={() => onSelectChat(chat.id)}
                  className="w-full text-left p-3 pr-10"
                >
                  <div
                    className={`text-sm truncate ${
                      theme === "dark" ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {chat.title}
                  </div>
                  <div
                    className={`text-xs mt-1 ${
                      theme === "dark" ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    {new Date(chat.created_at).toLocaleDateString()}
                  </div>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteChat(chat.id);
                  }}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-500/20`}
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div
        className={`p-4 border-t ${
          theme === "dark" ? "border-slate-800" : "border-slate-200"
        }`}
      >
        <div
          className={`mb-3 p-2 rounded-lg ${
            theme === "dark" ? "bg-white/5" : "bg-slate-100"
          }`}
        >
          <div
            className={`text-sm truncate ${
              theme === "dark" ? "text-white" : "text-slate-900"
            }`}
          >
            {userName}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={toggleTheme}
            variant="outline"
            size="sm"
            className={`flex-1 ${
              theme === "dark"
                ? "bg-white/5 hover:bg-white/10 border-white/10"
                : "bg-slate-100 hover:bg-slate-200 border-slate-200"
            }`}
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </Button>
          <Button
            onClick={onSignOut}
            variant="outline"
            size="sm"
            className={`flex-1 ${
              theme === "dark"
                ? "bg-white/5 hover:bg-white/10 border-white/10"
                : "bg-slate-100 hover:bg-slate-200 border-slate-200"
            }`}
          >
            <LogOut className="w-4 h-4 mr-1" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
