"use client";
import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send } from "lucide-react";
import { useHelpBot } from "@/hooks/useHelpBot";
import { BOT_QUICK_ASKS } from "@/lib/constants";

export function HelpBot() {
  const { open, setOpen, messages, inputValue, setInputValue, sendMessage } = useHelpBot();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(inputValue);
  }

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
        style={{ background: "linear-gradient(135deg, #4F8EF7, #8B5CF6)" }}
        aria-label="Open help chat"
      >
        {open ? <X size={22} color="#ffffff" /> : <MessageCircle size={22} color="#ffffff" />}
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 rounded-2xl overflow-hidden flex flex-col"
            style={{
              background: "rgba(10,10,20,0.97)",
              border: "1px solid rgba(79,142,247,0.2)",
              backdropFilter: "blur(20px)",
              maxHeight: "480px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center gap-3 px-4 py-3"
              style={{ background: "rgba(79,142,247,0.08)", borderBottom: "1px solid rgba(79,142,247,0.1)" }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                style={{ background: "linear-gradient(135deg, #4F8EF7, #8B5CF6)", color: "#ffffff" }}
              >
                B
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.9)" }}>
                  Bingo Assistant
                </p>
                <p className="text-xs flex items-center gap-1" style={{ color: "#4F8EF7" }}>
                  <span className="status-dot" style={{ width: 6, height: 6, display: "inline-block" }} />
                  Online
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3" style={{ minHeight: 0 }}>
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className="max-w-[80%] rounded-xl px-3 py-2 text-sm leading-relaxed"
                    style={
                      msg.role === "user"
                        ? {
                            background: "rgba(79,142,247,0.12)",
                            border: "1px solid rgba(79,142,247,0.2)",
                            color: "rgba(255,255,255,0.9)",
                          }
                        : {
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            color: "rgba(255,255,255,0.8)",
                          }
                    }
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick asks */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2 flex flex-wrap gap-2">
                {BOT_QUICK_ASKS.map((qa) => (
                  <button
                    key={qa.key}
                    onClick={() => sendMessage(qa.key)}
                    className="text-xs px-3 py-1.5 rounded-full transition-all"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "rgba(255,255,255,0.7)",
                    }}
                  >
                    {qa.emoji} {qa.label}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-2 px-3 py-3"
              style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
            >
              <input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask a question..."
                className="flex-1 bg-transparent text-sm outline-none"
                style={{ color: "rgba(255,255,255,0.9)" }}
              />
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-40"
                style={{ background: "#4F8EF7" }}
              >
                <Send size={14} color="#ffffff" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
