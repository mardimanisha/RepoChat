'use client'
import ChatInterface from "@/components/chat/ChatInterface";
import { Header } from "@/components/common/Header";
import ThemeProvider from "@/providers/ThemeProvider";

export default function Home() {
  return (
    <ThemeProvider>
       <div className="min-h-screen bg-background flex flex-col">
           <Header /> 
        <main className="flex-1 container mx-auto px-4 py-6 max-w-4xl">
          <ChatInterface />
        </main>
      </div>
    </ThemeProvider>
  );
}
