import { useState } from "react";
import { Github, Sparkles, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";
import { projectId, publicAnonKey } from "../../utils/supabase/info";

interface RepoInputProps {
  repos: any[];
  session: any;
  onRepoIngested: () => void;
  onStartChat: (repoId: string, repoName: string) => void;
  theme: "light" | "dark";
}

export function RepoInput({ repos, session, onRepoIngested, onStartChat, theme }: RepoInputProps) {
  const [repoUrl, setRepoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState("");
  const [ingestingRepo, setIngestingRepo] = useState<any>(null);

  const validateRepo = async () => {
    if (!repoUrl.trim()) return;

    setValidating(true);
    setError("");

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-1003346e/repo/validate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ repoUrl }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to validate repository");
      }

      // Start ingestion
      await startIngestion(data.repo);
    } catch (err: any) {
      setError(err.message || "Failed to validate repository");
      console.error("Validation error:", err);
    } finally {
      setValidating(false);
    }
  };

  const startIngestion = async (repoInfo: any) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-1003346e/repo/start-ingest`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ repoUrl, repoInfo }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to start ingestion");
      }

      // Poll for status
      pollIngestionStatus(data.repoId);
      setRepoUrl("");
    } catch (err: any) {
      setError(err.message || "Failed to start ingestion");
      console.error("Ingestion error:", err);
      setLoading(false);
    }
  };

  const pollIngestionStatus = async (repoId: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-1003346e/repo/status/${repoId}`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        const data = await response.json();
        setIngestingRepo({ id: repoId, ...data });

        if (data.status === "ready" || data.status === "failed") {
          clearInterval(interval);
          setLoading(false);
          setIngestingRepo(null);
          onRepoIngested();
        }
      } catch (error) {
        console.error("Status poll error:", error);
      }
    }, 2000);
  };

  return (
    <div
      className={`flex-1 flex flex-col items-center justify-center p-8 ${
        theme === "dark"
          ? "bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900"
          : "bg-gradient-to-br from-slate-50 via-purple-50 to-slate-50"
      }`}
    >
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Github className="w-16 h-16 text-purple-400" />
            <Sparkles className="w-14 h-14 text-pink-400" />
          </div>
          <h1
            className={`text-5xl mb-3 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent`}
          >
            Chat with GitHub Repositories
          </h1>
          <p
            className={`text-lg ${
              theme === "dark" ? "text-slate-300" : "text-slate-600"
            }`}
          >
            Enter a repository URL to start an AI-powered conversation
          </p>
        </div>

        {/* Input Card */}
        <Card
          className={`p-6 ${
            theme === "dark"
              ? "bg-white/5 border-white/10 backdrop-blur-xl"
              : "bg-white/80 border-slate-200 backdrop-blur-sm"
          }`}
        >
          <div className="flex gap-2 mb-4">
            <Input
              type="text"
              placeholder="https://github.com/owner/repository"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && validateRepo()}
              disabled={loading || validating}
              className={`flex-1 ${
                theme === "dark"
                  ? "bg-white/5 border-white/10 text-white placeholder:text-slate-400"
                  : "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400"
              }`}
            />
            <Button
              onClick={validateRepo}
              disabled={!repoUrl.trim() || loading || validating}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8"
            >
              {validating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Validating...
                </>
              ) : (
                "Add Repository"
              )}
            </Button>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {ingestingRepo && (
            <div
              className={`mt-4 p-4 rounded-lg ${
                theme === "dark" ? "bg-white/5" : "bg-slate-100"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                <span
                  className={`text-sm ${
                    theme === "dark" ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  Processing repository... {ingestingRepo.progress}%
                </span>
              </div>
              <Progress value={ingestingRepo.progress} className="h-2" />
            </div>
          )}
        </Card>

        {/* Existing Repositories */}
        {repos.length > 0 && (
          <div className="mt-8">
            <h2
              className={`text-xl mb-4 ${
                theme === "dark" ? "text-white" : "text-slate-900"
              }`}
            >
              Your Repositories
            </h2>
            <div className="grid gap-3">
              {repos.map((repo) => (
                <Card
                  key={repo.id}
                  className={`p-4 ${
                    theme === "dark"
                      ? "bg-white/5 border-white/10 backdrop-blur-xl hover:bg-white/10"
                      : "bg-white/80 border-slate-200 backdrop-blur-sm hover:bg-white"
                  } transition-colors cursor-pointer`}
                  onClick={() => onStartChat(repo.id, repo.fullName)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Github className="w-4 h-4 text-purple-400" />
                        <span
                          className={`${
                            theme === "dark" ? "text-white" : "text-slate-900"
                          }`}
                        >
                          {repo.fullName}
                        </span>
                      </div>
                      {repo.description && (
                        <p
                          className={`text-sm ${
                            theme === "dark" ? "text-slate-400" : "text-slate-600"
                          }`}
                        >
                          {repo.description}
                        </p>
                      )}
                      {repo.language && (
                        <div className="mt-2">
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              theme === "dark"
                                ? "bg-purple-500/20 text-purple-300"
                                : "bg-purple-100 text-purple-700"
                            }`}
                          >
                            {repo.language}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      {repo.status === "ready" ? (
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                      ) : repo.status === "failed" ? (
                        <AlertCircle className="w-5 h-5 text-red-400" />
                      ) : (
                        <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
