export const isValidGithubUrl = (url: string): boolean => {
  return url.trim().includes("github.com") && url.includes("/");
};

export const formatRepositoryName = (url: string): string => {
  return url.replace("https://github.com/", "");
};
