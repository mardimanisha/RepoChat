import type { Message } from "../types";

export const generateMessageId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const createMessage = (
  type: Message["type"],
  content: string,
  citations?: Message["citations"]
): Message => ({
  id: generateMessageId(),
  type,
  content,
  citations,
  timestamp: new Date(),
});

export const createWelcomeMessage = (welcomeText: string): Message =>
  createMessage("assistant", welcomeText);
