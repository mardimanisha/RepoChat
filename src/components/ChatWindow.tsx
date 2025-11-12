import { useState, useEffect, useRef } from "react";
import { Send, Loader2, Code, Copy, Check, FileCode } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { ScrollArea } from "./ui/scroll-area";
import { MessageContent } from "./MessageContent";
import { projectId } from "../utils/supabase/info";

interface ChatWindowProps {
  chatId: string;
  repo: any;
  session: any;
  theme: "light" | "dark";
}

export function ChatWindow({ chatId, repo, session, theme }: ChatWindowProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [codeSnippet, setCodeSnippet] = useState("");
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
  }, [chatId]);

  useEffect(() => {
    // Scroll to bottom when messages update
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const loadMessages = async () => {
    setInitialLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-1003346e/chat/${chatId}/messages`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() && !codeSnippet.trim()) return;

    setLoading(true);
    const userMessage = input;
    const userCode = codeSnippet;

    // Clear input immediately
    setInput("");
    setCodeSnippet("");
    setShowCodeInput(false);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-1003346e/chat/message`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            chatId,
            content: userMessage,
            codeSnippet: userCode || undefined,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      // Add both messages to the list
      setMessages((prev) => [...prev, data.userMessage, data.aiMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      // Re-add the message on error
      setInput(userMessage);
      setCodeSnippet(userCode);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen">
      {/* Header */}
      <div
        className={`px-6 py-4 border-b ${
          theme === "dark"
            ? "bg-slate-950/50 border-slate-800 backdrop-blur-xl"
            : "bg-white/80 border-slate-200 backdrop-blur-sm"
        }`}
      >
        <div className="flex items-center gap-2">
          <FileCode className="w-5 h-5 text-purple-400" />
          <h2
            className={`text-lg ${
              theme === "dark" ? "text-white" : "text-slate-900"
            }`}
          >
            {repo.fullName}
          </h2>
          <span
            className={`text-xs px-2 py-1 rounded ${
              theme === "dark"
                ? "bg-green-500/20 text-green-300"
                : "bg-green-100 text-green-700"
            }`}
          >
            {repo.status}
          </span>
        </div>
        {repo.description && (
          <p
            className={`text-sm mt-1 ${
              theme === "dark" ? "text-slate-400" : "text-slate-600"
            }`}
          >
            {repo.description}
          </p>
        )}
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-6">
        {initialLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Code className="w-16 h-16 text-purple-400 mb-4" />
            <h3
              className={`text-xl mb-2 ${
                theme === "dark" ? "text-white" : "text-slate-900"
              }`}
            >
              Start chatting about {repo.fullName}
            </h3>
            <p
              className={`text-sm ${
                theme === "dark" ? "text-slate-400" : "text-slate-600"
              } max-w-md text-center`}
            >
              Ask questions about the code, architecture, implementation details, or
              anything else about this repository.
            </p>
            <div className="mt-6 grid grid-cols-1 gap-2 max-w-md">
              <button
                onClick={() => setInput("What is this repository about?")}
                className={`text-left p-3 rounded-lg border ${
                  theme === "dark"
                    ? "bg-white/5 border-white/10 hover:bg-white/10 text-slate-300"
                    : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
                } transition-colors`}
              >
                What is this repository about?
              </button>
              <button
                onClick={() => setInput("Explain the main architecture")}
                className={`text-left p-3 rounded-lg border ${
                  theme === "dark"
                    ? "bg-white/5 border-white/10 hover:bg-white/10 text-slate-300"
                    : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
                } transition-colors`}
              >
                Explain the main architecture
              </button>
              <button
                onClick={() => setInput("What are the key files I should look at?")}
                className={`text-left p-3 rounded-lg border ${
                  theme === "dark"
                    ? "bg-white/5 border-white/10 hover:bg-white/10 text-slate-300"
                    : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
                } transition-colors`}
              >
                What are the key files I should look at?
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 max-w-4xl mx-auto">
            {messages.map((message, index) => (
              <div
                key={message.id || index}
                className={`flex gap-4 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                    <Code className="w-4 h-4 text-white" />
                  </div>
                )}
                <div
                  className={`flex-1 max-w-3xl ${
                    message.role === "user" ? "max-w-xl" : ""
                  }`}
                >
                  {message.role === "user" ? (
                    <div
                      className={`p-4 rounded-2xl ${
                        theme === "dark"
                          ? "bg-purple-500/20 text-white"
                          : "bg-purple-100 text-slate-900"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      {message.codeSnippet && (
                        <div className="mt-2">
                          <pre
                            className={`p-3 rounded-lg text-sm overflow-x-auto ${
                              theme === "dark"
                                ? "bg-black/30 text-slate-300"
                                : "bg-white/50 text-slate-800"
                            }`}
                          >
                            <code>{message.codeSnippet}</code>
                          </pre>
                        </div>
                      )}
                    </div>
                  ) : (
                    <MessageContent
                      content={message.content}
                      sources={message.sources}
                      theme={theme}
                    />
                  )}
                </div>
                {message.role === "user" && (
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      theme === "dark" ? "bg-white/10" : "bg-slate-200"
                    }`}
                  >
                    <span
                      className={`text-sm ${
                        theme === "dark" ? "text-white" : "text-slate-900"
                      }`}
                    >
                      {session.user?.user_metadata?.name?.[0]?.toUpperCase() ||
                        session.user?.email?.[0]?.toUpperCase() ||
                        "U"}
                    </span>
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                  <Code className="w-4 h-4 text-white" />
                </div>
                <div
                  className={`flex-1 p-4 rounded-2xl ${
                    theme === "dark"
                      ? "bg-white/5 text-white"
                      : "bg-slate-100 text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                    <span>Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div
        className={`px-6 py-4 border-t ${
          theme === "dark"
            ? "bg-slate-950/50 border-slate-800 backdrop-blur-xl"
            : "bg-white/80 border-slate-200 backdrop-blur-sm"
        }`}
      >
        <div className="max-w-4xl mx-auto">
          {showCodeInput && (
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <label
                  className={`text-sm ${
                    theme === "dark" ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  Code Snippet (Optional)
                </label>
                <button
                  onClick={() => {
                    setShowCodeInput(false);
                    setCodeSnippet("");
                  }}
                  className={`text-xs ${
                    theme === "dark"
                      ? "text-slate-400 hover:text-white"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Remove
                </button>
              </div>
              <Textarea
                value={codeSnippet}
                onChange={(e) => setCodeSnippet(e.target.value)}
                placeholder="Paste your code snippet here..."
                className={`font-mono text-sm min-h-[100px] ${
                  theme === "dark"
                    ? "bg-black/30 border-white/10 text-white placeholder:text-slate-500"
                    : "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400"
                }`}
              />
            </div>
          )}
          <div className="flex gap-2">
            {!showCodeInput && (
              <Button
                onClick={() => setShowCodeInput(true)}
                variant="outline"
                size="icon"
                className={`${
                  theme === "dark"
                    ? "bg-white/5 hover:bg-white/10 border-white/10"
                    : "bg-white hover:bg-slate-50 border-slate-200"
                }`}
              >
                <Code className="w-4 h-4" />
              </Button>
            )}
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Ask anything about this repository..."
              disabled={loading}
              className={`flex-1 min-h-[60px] max-h-[200px] resize-none ${
                theme === "dark"
                  ? "bg-white/5 border-white/10 text-white placeholder:text-slate-400"
                  : "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400"
              }`}
            />
            <Button
              onClick={handleSendMessage}
              disabled={(!input.trim() && !codeSnippet.trim()) || loading}
              size="icon"
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white h-[60px] w-[60px]"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
          <p
            className={`text-xs mt-2 ${
              theme === "dark" ? "text-slate-500" : "text-slate-400"
            }`}
          >
            Press Enter to send, Shift + Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}
