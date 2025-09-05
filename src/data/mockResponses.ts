import type { Citation } from "../types";

export interface MockResponse {
  content: string;
  citations: Citation[];
}

export const getMockResponses = (repoUrl: string): MockResponse[] => [
  {
    content:
      "Based on the repository structure, this appears to be a React application using TypeScript. The main components are organized in the `/src/components` directory, with the entry point being `App.tsx`.\n\nThe application follows modern React patterns with functional components and hooks. Here's what I found:",
    citations: [
      {
        filename: "src/App.tsx",
        content: `import React from 'react';\nimport { BrowserRouter as Router, Routes, Route } from 'react-router-dom';\nimport Header from './components/Header';\nimport HomePage from './pages/HomePage';\n\nfunction App() {\n  return (\n    <Router>\n      <div className="App">\n        <Header />\n        <Routes>\n          <Route path="/" element={<HomePage />} />\n        </Routes>\n      </div>\n    </Router>\n  );\n}\n\nexport default App;`,
        lineStart: 1,
        lineEnd: 16,
        url: `${repoUrl}/blob/main/src/App.tsx`,
      },
    ],
  },
  {
    content:
      "The application uses a clean component architecture. I can see several key patterns:\n\n1. **Component Organization**: Components are properly separated into their own files\n2. **TypeScript Integration**: Strong typing throughout the codebase\n3. **Modern React**: Uses hooks and functional components\n\nWould you like me to explain any specific part in more detail?",
    citations: [
      {
        filename: "src/components/Header.tsx",
        content: `interface HeaderProps {\n  title: string;\n  onMenuClick?: () => void;\n}\n\nexport const Header: React.FC<HeaderProps> = ({ title, onMenuClick }) => {\n  return (\n    <header className="bg-white shadow-sm">\n      <div className="max-w-7xl mx-auto px-4">\n        <h1 className="text-xl font-semibold">{title}</h1>\n      </div>\n    </header>\n  );\n};`,
        lineStart: 1,
        lineEnd: 12,
        url: `${repoUrl}/blob/main/src/components/Header.tsx`,
      },
    ],
  },
];

export const getRandomMockResponse = (repoUrl: string): MockResponse => {
  const responses = getMockResponses(repoUrl);
  return responses[Math.floor(Math.random() * responses.length)];
};
