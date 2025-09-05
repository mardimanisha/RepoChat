import { Message } from "@/types";
import { useEffect, useRef } from "react";

export const useAutoScroll = (messages: Message[]) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  return scrollAreaRef;
};
