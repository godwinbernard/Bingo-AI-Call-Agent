"use client";
import { useState, useCallback } from "react";
import { BOT_RESPONSES } from "@/lib/constants";
import type { BotMessage } from "@/types";

export function useHelpBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<BotMessage[]>([
    {
      role: "bot",
      content: "Hi! I'm Bingo's assistant. Ask me anything about pricing, features, or getting started! 👋",
    },
  ]);
  const [inputValue, setInputValue] = useState("");

  const sendMessage = useCallback((text: string) => {
    if (!text.trim()) return;

    const userMsg: BotMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");

    setTimeout(() => {
      const key = text.toLowerCase();
      let response = BOT_RESPONSES.default;
      for (const [k, v] of Object.entries(BOT_RESPONSES)) {
        if (key.includes(k)) {
          response = v;
          break;
        }
      }
      setMessages((prev) => [...prev, { role: "bot", content: response }]);
    }, 600);
  }, []);

  return {
    open,
    setOpen,
    messages,
    inputValue,
    setInputValue,
    sendMessage,
  };
}
