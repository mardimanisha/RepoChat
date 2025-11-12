import { useState } from "react";
import { Copy, Check, FileText } from "lucide-react";
import { Button } from "./ui/button";

interface MessageContentProps {
  content: string;
  sources?: string[];
  theme: "light" | "dark";
}

export function MessageContent({ content, sources, theme }: MessageContentProps) {
  const [copiedBlocks, setCopiedBlocks] = useState<Set<number>>(new Set());

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedBlocks((prev) => new Set(prev).add(index));
    setTimeout(() => {
      setCopiedBlocks((prev) => {
        const next = new Set(prev);
        next.delete(index);
        return next;
      });
    }, 2000);
  };

  // Simple markdown-like parsing
  const renderContent = () => {
    const parts: JSX.Element[] = [];
    let currentIndex = 0;
    let blockIndex = 0;

    // Split by code blocks
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      // Add text before code block
      if (match.index > currentIndex) {
        const textContent = content.substring(currentIndex, match.index);
        parts.push(
          <div key={`text-${blockIndex}`} className="prose prose-invert max-w-none">
            {renderTextContent(textContent)}
          </div>
        );
        blockIndex++;
      }

      // Add code block
      const language = match[1] || "code";
      const code = match[2].trim();
      const isCopied = copiedBlocks.has(blockIndex);

      parts.push(
        <div key={`code-${blockIndex}`} className="my-4">
          <div
            className={`flex items-center justify-between px-4 py-2 rounded-t-lg ${
              theme === "dark"
                ? "bg-slate-800 text-slate-300"
                : "bg-slate-200 text-slate-700"
            }`}
          >
            <span className="text-sm">{language}</span>
            <Button
              onClick={() => copyToClipboard(code, blockIndex)}
              variant="ghost"
              size="sm"
              className="h-6 px-2"
            >
              {isCopied ? (
                <>
                  <Check className="w-3 h-3 mr-1" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 mr-1" />
                  Copy
                </>
              )}
            </Button>
          </div>
          <pre
            className={`p-4 rounded-b-lg overflow-x-auto ${
              theme === "dark"
                ? "bg-slate-900 text-slate-300"
                : "bg-slate-100 text-slate-800"
            }`}
          >
            <code className="text-sm">{code}</code>
          </pre>
        </div>
      );

      currentIndex = match.index + match[0].length;
      blockIndex++;
    }

    // Add remaining text
    if (currentIndex < content.length) {
      const textContent = content.substring(currentIndex);
      parts.push(
        <div key={`text-${blockIndex}`} className="prose prose-invert max-w-none">
          {renderTextContent(textContent)}
        </div>
      );
    }

    return parts;
  };

  const renderTextContent = (text: string) => {
    // Split by paragraphs
    const paragraphs = text.split("\n\n");
    return paragraphs.map((para, i) => {
      if (!para.trim()) return null;

      // Check if it's a list
      if (para.match(/^[\-\*]\s/m)) {
        const items = para.split("\n").filter((line) => line.trim());
        return (
          <ul key={i} className={`list-disc list-inside space-y-1 my-3`}>
            {items.map((item, j) => (
              <li
                key={j}
                className={theme === "dark" ? "text-slate-300" : "text-slate-700"}
              >
                {item.replace(/^[\-\*]\s/, "")}
              </li>
            ))}
          </ul>
        );
      }

      // Check if it's a numbered list
      if (para.match(/^\d+\.\s/m)) {
        const items = para.split("\n").filter((line) => line.trim());
        return (
          <ol key={i} className={`list-decimal list-inside space-y-1 my-3`}>
            {items.map((item, j) => (
              <li
                key={j}
                className={theme === "dark" ? "text-slate-300" : "text-slate-700"}
              >
                {item.replace(/^\d+\.\s/, "")}
              </li>
            ))}
          </ol>
        );
      }

      // Check if it's a heading
      if (para.startsWith("# ")) {
        return (
          <h1
            key={i}
            className={`text-2xl mt-4 mb-2 ${
              theme === "dark" ? "text-white" : "text-slate-900"
            }`}
          >
            {para.replace(/^#\s/, "")}
          </h1>
        );
      }
      if (para.startsWith("## ")) {
        return (
          <h2
            key={i}
            className={`text-xl mt-3 mb-2 ${
              theme === "dark" ? "text-white" : "text-slate-900"
            }`}
          >
            {para.replace(/^##\s/, "")}
          </h2>
        );
      }
      if (para.startsWith("### ")) {
        return (
          <h3
            key={i}
            className={`text-lg mt-3 mb-2 ${
              theme === "dark" ? "text-white" : "text-slate-900"
            }`}
          >
            {para.replace(/^###\s/, "")}
          </h3>
        );
      }

      // Regular paragraph with inline code
      const parts = para.split(/(`[^`]+`)/g);
      return (
        <p
          key={i}
          className={`my-2 leading-relaxed ${
            theme === "dark" ? "text-slate-300" : "text-slate-700"
          }`}
        >
          {parts.map((part, j) => {
            if (part.startsWith("`") && part.endsWith("`")) {
              return (
                <code
                  key={j}
                  className={`px-1.5 py-0.5 rounded text-sm ${
                    theme === "dark"
                      ? "bg-slate-800 text-purple-300"
                      : "bg-slate-200 text-purple-700"
                  }`}
                >
                  {part.slice(1, -1)}
                </code>
              );
            }
            return part;
          })}
        </p>
      );
    });
  };

  return (
    <div
      className={`p-4 rounded-2xl ${
        theme === "dark"
          ? "bg-white/5 text-white"
          : "bg-slate-100 text-slate-900"
      }`}
    >
      {renderContent()}

      {sources && sources.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-purple-400" />
            <span
              className={`text-sm ${
                theme === "dark" ? "text-slate-400" : "text-slate-600"
              }`}
            >
              Sources:
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {sources.map((source, i) => (
              <span
                key={i}
                className={`text-xs px-2 py-1 rounded ${
                  theme === "dark"
                    ? "bg-purple-500/20 text-purple-300"
                    : "bg-purple-100 text-purple-700"
                }`}
              >
                {source}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
