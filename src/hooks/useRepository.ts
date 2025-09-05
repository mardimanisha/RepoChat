import { useState } from "react";
import type { RepositoryState, Message } from "../types";
import { LOADING_DELAY, WELCOME_MESSAGE } from "../constants";
import { isValidGithubUrl } from "../utils/validationUtils";
import { createWelcomeMessage } from "../utils/messageUtils";

export const useRepository = (onRepoLoaded: (message: Message) => void) => {
  const [repositoryState, setRepositoryState] = useState<RepositoryState>({
    url: "",
    isLoaded: false,
    isLoading: false,
  });

  const setRepoUrl = (url: string) => {
    setRepositoryState((prev) => ({ ...prev, url }));
  };

  const loadRepository = async () => {
    if (!repositoryState.url.trim()) return;

    setRepositoryState((prev) => ({ ...prev, isLoading: true }));

    // Simulate repository loading
    setTimeout(() => {
      setRepositoryState((prev) => ({
        ...prev,
        isLoading: false,
        isLoaded: true,
      }));

      const welcomeMessage = createWelcomeMessage(WELCOME_MESSAGE);
      onRepoLoaded(welcomeMessage);
    }, LOADING_DELAY);
  };

  const isValidUrl = isValidGithubUrl(repositoryState.url);
  const canLoadRepo = isValidUrl && !repositoryState.isLoading;

  return {
    repositoryState,
    setRepoUrl,
    loadRepository,
    isValidUrl,
    canLoadRepo,
  };
};
