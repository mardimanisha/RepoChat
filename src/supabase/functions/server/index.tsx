import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { createClient } from '@supabase/supabase-js';
import * as kv from './kv_store';

// Set up __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../../../../.env.local') });

const app = new Hono();

// Middleware
app.use("*", cors());
app.use("*", logger(console.log));

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL ?? "",
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""
);

// ==================== AUTH ROUTES ====================

app.post("/make-server-1003346e/auth/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      email_confirm: true, // Auto-confirm since email server isn't configured
    });

    if (error) {
      console.log(`Signup error: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    // Store user in KV store
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      email: data.user.email,
      name,
      created_at: new Date().toISOString(),
    });

    return c.json({ user: data.user });
  } catch (error) {
    console.log(`Signup error: ${error}`);
    return c.json({ error: "Signup failed" }, 500);
  }
});

// ==================== REPO ROUTES ====================

app.post("/make-server-1003346e/repo/validate", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { repoUrl } = await c.req.json();
    
    // Extract owner and repo from GitHub URL
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) {
      return c.json({ error: "Invalid GitHub URL" }, 400);
    }

    const [, owner, repo] = match;
    const cleanRepo = repo.replace(/\.git$/, "");

    // Validate with GitHub API
    const githubToken = process.env.GITHUB_TOKEN;
    const response = await fetch(`https://api.github.com/repos/${owner}/${cleanRepo}`, {
      headers: githubToken ? { Authorization: `token ${githubToken}` } : {},
    });

    if (!response.ok) {
      return c.json({ error: "Repository not found or not accessible" }, 404);
    }

    const repoData = await response.json();

    return c.json({
      valid: true,
      repo: {
        owner,
        name: cleanRepo,
        fullName: `${owner}/${cleanRepo}`,
        description: repoData.description,
        stars: repoData.stargazers_count,
        language: repoData.language,
      },
    });
  } catch (error) {
    console.log(`Repo validation error: ${error}`);
    return c.json({ error: "Validation failed" }, 500);
  }
});

app.post("/make-server-1003346e/repo/start-ingest", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { repoUrl, repoInfo } = await c.req.json();
    
    const repoId = `repo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Store repo metadata
    await kv.set(`repo:${repoId}`, {
      id: repoId,
      userId: user.id,
      url: repoUrl,
      fullName: repoInfo.fullName,
      description: repoInfo.description,
      language: repoInfo.language,
      status: "ingesting",
      progress: 0,
      created_at: new Date().toISOString(),
    });

    // Add repo to user's repos list
    const userRepos = await kv.get(`user:${user.id}:repos`) || [];
    userRepos.push(repoId);
    await kv.set(`user:${user.id}:repos`, userRepos);

    // Start ingestion in background (async)
    ingestRepository(repoId, repoInfo.fullName, user.id).catch(err => {
      console.log(`Ingestion error for ${repoId}: ${err}`);
    });

    return c.json({ repoId, status: "started" });
  } catch (error) {
    console.log(`Start ingest error: ${error}`);
    return c.json({ error: "Failed to start ingestion" }, 500);
  }
});

app.get("/make-server-1003346e/repo/status/:repoId", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const repoId = c.req.param("repoId");
    const repo = await kv.get(`repo:${repoId}`);

    if (!repo) {
      return c.json({ error: "Repository not found" }, 404);
    }

    return c.json({ status: repo.status, progress: repo.progress });
  } catch (error) {
    console.log(`Get repo status error: ${error}`);
    return c.json({ error: "Failed to get status" }, 500);
  }
});

app.get("/make-server-1003346e/repo/list", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const repoIds = await kv.get(`user:${user.id}:repos`) || [];
    const repos = await kv.mget(repoIds.map((id: string) => `repo:${id}`));

    return c.json({ repos });
  } catch (error) {
    console.log(`List repos error: ${error}`);
    return c.json({ error: "Failed to list repositories" }, 500);
  }
});

// ==================== CHAT ROUTES ====================

app.post("/make-server-1003346e/chat/create", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { repoId, title } = await c.req.json();
    
    const chatId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await kv.set(`chat:${chatId}`, {
      id: chatId,
      userId: user.id,
      repoId,
      title: title || "New Chat",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // Add chat to user's chats list
    const userChats = await kv.get(`user:${user.id}:chats`) || [];
    userChats.unshift(chatId);
    await kv.set(`user:${user.id}:chats`, userChats);

    return c.json({ chatId });
  } catch (error) {
    console.log(`Create chat error: ${error}`);
    return c.json({ error: "Failed to create chat" }, 500);
  }
});

app.get("/make-server-1003346e/chat/list", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const chatIds = await kv.get(`user:${user.id}:chats`) || [];
    const chats = await kv.mget(chatIds.map((id: string) => `chat:${id}`));

    return c.json({ chats });
  } catch (error) {
    console.log(`List chats error: ${error}`);
    return c.json({ error: "Failed to list chats" }, 500);
  }
});

app.get("/make-server-1003346e/chat/:chatId/messages", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const chatId = c.req.param("chatId");
    const messages = await kv.getByPrefix(`message:${chatId}:`);

    return c.json({ messages: messages.sort((a: any, b: any) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )});
  } catch (error) {
    console.log(`Get messages error: ${error}`);
    return c.json({ error: "Failed to get messages" }, 500);
  }
});

app.post("/make-server-1003346e/chat/message", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { chatId, content, codeSnippet } = await c.req.json();
    
    // Get chat and repo info
    const chat = await kv.get(`chat:${chatId}`);
    if (!chat) {
      return c.json({ error: "Chat not found" }, 404);
    }

    const repo = await kv.get(`repo:${chat.repoId}`);
    if (!repo) {
      return c.json({ error: "Repository not found" }, 404);
    }

    // Save user message
    const userMessageId = `message:${chatId}:${Date.now()}_user`;
    await kv.set(userMessageId, {
      id: userMessageId,
      chatId,
      role: "user",
      content,
      codeSnippet,
      created_at: new Date().toISOString(),
    });

    // Generate AI response using RAG
    const aiResponse = await generateRAGResponse(content, repo, codeSnippet);

    // Save AI message
    const aiMessageId = `message:${chatId}:${Date.now()}_assistant`;
    await kv.set(aiMessageId, {
      id: aiMessageId,
      chatId,
      role: "assistant",
      content: aiResponse.content,
      sources: aiResponse.sources,
      created_at: new Date().toISOString(),
    });

    // Update chat timestamp
    chat.updated_at = new Date().toISOString();
    await kv.set(`chat:${chatId}`, chat);

    return c.json({
      userMessage: { id: userMessageId, role: "user", content, codeSnippet },
      aiMessage: { id: aiMessageId, role: "assistant", content: aiResponse.content, sources: aiResponse.sources },
    });
  } catch (error) {
    console.log(`Chat message error: ${error}`);
    return c.json({ error: "Failed to process message" }, 500);
  }
});

app.delete("/make-server-1003346e/chat/:chatId", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const chatId = c.req.param("chatId");
    
    // Delete messages
    const messages = await kv.getByPrefix(`message:${chatId}:`);
    await kv.mdel(messages.map((msg: any) => msg.id));
    
    // Delete chat
    await kv.del(`chat:${chatId}`);
    
    // Remove from user's chat list
    const userChats = await kv.get(`user:${user.id}:chats`) || [];
    await kv.set(`user:${user.id}:chats`, userChats.filter((id: string) => id !== chatId));

    return c.json({ success: true });
  } catch (error) {
    console.log(`Delete chat error: ${error}`);
    return c.json({ error: "Failed to delete chat" }, 500);
  }
});

// ==================== HEALTH CHECK ====================

app.get("/make-server-1003346e/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ==================== RAG FUNCTIONS ====================

async function ingestRepository(repoId: string, fullName: string, userId: string) {
  try {
    const [owner, repo] = fullName.split("/");
    const githubToken = process.env.GITHUB_TOKEN;
    
    // Update status
    const repoData = await kv.get(`repo:${repoId}`);
    repoData.status = "fetching";
    repoData.progress = 10;
    await kv.set(`repo:${repoId}`, repoData);

    // Fetch repository tree
    const treeResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/main?recursive=1`,
      { headers: githubToken ? { Authorization: `token ${githubToken}` } : {} }
    );

    if (!treeResponse.ok) {
      throw new Error("Failed to fetch repository tree");
    }

    const treeData = await treeResponse.json();
    
    // Filter code files
    const codeFiles = treeData.tree.filter((item: any) => 
      item.type === "blob" && 
      /\.(ts|tsx|js|jsx|py|java|cpp|c|go|rs|rb|php|cs|swift|kt|md|json|yaml|yml)$/i.test(item.path) &&
      !item.path.includes("node_modules") &&
      !item.path.includes(".git") &&
      !item.path.includes("dist") &&
      !item.path.includes("build")
    ).slice(0, 50); // Limit to 50 files for demo

    repoData.status = "embedding";
    repoData.progress = 30;
    await kv.set(`repo:${repoId}`, repoData);

    // Fetch and embed files
    const hfApiKey = process.env.HUGGINGFACE_API_KEY;
    if (!hfApiKey) {
      throw new Error("HuggingFace API key not configured");
    }

    for (let i = 0; i < codeFiles.length; i++) {
      const file = codeFiles[i];
      
      // Fetch file content
      const fileResponse = await fetch(
        `https://raw.githubusercontent.com/${owner}/${repo}/main/${file.path}`
      );
      
      if (fileResponse.ok) {
        const content = await fileResponse.text();
        
        // Chunk the content
        const chunks = chunkText(content, file.path);
        
        // Create embeddings for each chunk
        for (const chunk of chunks) {
          const embedding = await createEmbedding(chunk.text, hfApiKey);
          
          const vectorId = `vector:${repoId}:${file.path}:${chunk.index}`;
          await kv.set(vectorId, {
            id: vectorId,
            repoId,
            filePath: file.path,
            chunkIndex: chunk.index,
            text: chunk.text,
            embedding,
          });
        }
      }
      
      // Update progress
      repoData.progress = 30 + Math.floor((i / codeFiles.length) * 60);
      await kv.set(`repo:${repoId}`, repoData);
    }

    // Mark as complete
    repoData.status = "ready";
    repoData.progress = 100;
    await kv.set(`repo:${repoId}`, repoData);
    
  } catch (error) {
    console.log(`Ingestion error for ${repoId}: ${error}`);
    const repoData = await kv.get(`repo:${repoId}`);
    if (repoData) {
      repoData.status = "failed";
      repoData.error = String(error);
      await kv.set(`repo:${repoId}`, repoData);
    }
  }
}

function chunkText(text: string, filePath: string): Array<{ text: string; index: number }> {
  const lines = text.split("\n");
  const chunks: Array<{ text: string; index: number }> = [];
  const chunkSize = 100; // lines per chunk
  
  for (let i = 0; i < lines.length; i += chunkSize) {
    const chunkLines = lines.slice(i, i + chunkSize);
    chunks.push({
      text: `File: ${filePath}\n\n${chunkLines.join("\n")}`,
      index: Math.floor(i / chunkSize),
    });
  }
  
  return chunks;
}

async function createEmbedding(text: string, apiKey: string): Promise<number[]> {
  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: text }),
      }
    );

    if (!response.ok) {
      throw new Error(`Embedding failed: ${response.statusText}`);
    }

    const embedding = await response.json();
    return embedding;
  } catch (error) {
    console.log(`Embedding error: ${error}`);
    // Return dummy embedding on error
    return new Array(384).fill(0);
  }
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function generateRAGResponse(
  query: string,
  repo: any,
  codeSnippet?: string
): Promise<{ content: string; sources: string[] }> {
  try {
    const hfApiKey = process.env.HUGGINGFACE_API_KEY;
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY;

    if (!hfApiKey || !anthropicApiKey) {
      return {
        content: "API keys not configured. Please set HUGGINGFACE_API_KEY and ANTHROPIC_API_KEY environment variables.",
        sources: [],
      };
    }

    // Create query embedding
    const queryEmbedding = await createEmbedding(query, hfApiKey);

    // Retrieve relevant chunks
    const vectors = await kv.getByPrefix(`vector:${repo.id}:`);
    
    if (!vectors || vectors.length === 0) {
      return {
        content: "This repository is still being processed. Please wait a moment and try again.",
        sources: [],
      };
    }

    // Calculate similarities and get top-k
    const similarities = vectors.map((vec: any) => ({
      ...vec,
      similarity: cosineSimilarity(queryEmbedding, vec.embedding),
    }));

    const topK = similarities
      .sort((a: any, b: any) => b.similarity - a.similarity)
      .slice(0, 5);

    // Build context
    const context = topK.map((item: any) => item.text).join("\n\n---\n\n");
    const sources = [...new Set(topK.map((item: any) => item.filePath))];

    // Build prompt
    let prompt = `You are a helpful AI assistant that answers questions about the GitHub repository "${repo.fullName}".

Context from the repository:
${context}

${codeSnippet ? `\nUser provided code snippet:\n\`\`\`\n${codeSnippet}\n\`\`\`\n` : ""}

User question: ${query}

Please provide a helpful and accurate answer based on the repository context. If you reference specific files, mention them.`;

    // Call Anthropic API
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": anthropicApiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.content[0]?.text || "I couldn't generate a response.";

    return { content, sources };
  } catch (error) {
    console.log(`RAG generation error: ${error}`);
    return {
      content: `Error generating response: ${error}. Please ensure your API keys are configured correctly.`,
      sources: [],
    };
  }
}

// Start the server
const port = process.env.PORT || 3000;
app.fetch(
  new Request(`http://localhost:${port}`, {
    method: 'GET',
    headers: {
      'content-type': 'application/json',
    },
  })
);

console.log(`Server running on port ${port}`);
