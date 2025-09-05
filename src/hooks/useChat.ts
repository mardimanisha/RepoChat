import { useState } from "react";
import type { Message, ChatState } from "../types";
import { RESPONSE_DELAY } from "../constants";
import { createMessage } from "../utils/messageUtils";
import { getRandomMockResponse } from "../data/mockResponses";

export const useChat = (repoUrl: string) => {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    inputMessage: "",
    isResponding: false,
  });

  const addMessage = (message: Message) => {
    setChatState((prev) => ({
      ...prev,
      messages: [...prev.messages, message],
    }));
  };

  const setMessages = (messages: Message[]) => {
    setChatState((prev) => ({ ...prev, messages }));
  };

  const setInputMessage = (message: string) => {
    setChatState((prev) => ({ ...prev, inputMessage: message }));
  };

  const sendMessage = async () => {
    if (!chatState.inputMessage.trim()) return;

    const userMessage = createMessage("user", chatState.inputMessage);
    addMessage(userMessage);

    setInputMessage("");
    setChatState((prev) => ({ ...prev, isResponding: true }));

    // Simulate AI response
    setTimeout(() => {
      const mockResponse = getRandomMockResponse(repoUrl);
      const assistantMessage = createMessage(
        "assistant",
        mockResponse.content,
        mockResponse.citations
      );

      addMessage(assistantMessage);
      setChatState((prev) => ({ ...prev, isResponding: false }));
    }, RESPONSE_DELAY);
  };

  const canSendMessage =
    chatState.inputMessage.trim() && !chatState.isResponding;

  return {
    chatState,
    addMessage,
    setMessages,
    setInputMessage,
    sendMessage,
    canSendMessage,
  };
};
