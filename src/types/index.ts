export interface Citation {
  filename: string;
  content: string;
  lineStart?: number;
  lineEnd?: number;
  url?: string;
}

export interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  citations?: Citation[];
  timestamp: Date;
}

export interface RepositoryState {
  url: string;
  isLoaded: boolean;
  isLoading: boolean;
}

export interface ChatState {
  messages: Message[];
  inputMessage: string;
  isResponding: boolean;
}
