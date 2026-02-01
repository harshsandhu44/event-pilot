"use client";

import { useEffect, useRef } from "react";
import { useChat } from "@/hooks/useChat";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

export function TextChat() {
  const { messages, input, setInput, handleSubmit, isLoading } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-3 sm:space-y-4 mb-3 sm:mb-4 px-1">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground py-6 sm:py-8 px-4">
            <p className="text-base sm:text-lg font-medium">Welcome to EventPilot!</p>
            <p className="text-xs sm:text-sm mt-2">
              Ask me about stalls, get directions, or explore the event.
            </p>
          </div>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[85%] sm:max-w-[80%] rounded-lg px-3 py-2 sm:px-4 sm:py-2.5 ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              <p className="text-sm sm:text-base whitespace-pre-wrap break-words">
                {message.content}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[85%] sm:max-w-[80%] rounded-lg px-3 py-2 sm:px-4 sm:py-2.5 bg-muted">
              <p className="text-sm text-muted-foreground">Thinking...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2 px-1">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about stalls or directions..."
          disabled={isLoading}
          className="flex-1 text-sm sm:text-base h-10 sm:h-11"
        />
        <Button
          type="submit"
          disabled={isLoading || !input.trim()}
          size="icon"
          className="h-10 w-10 sm:h-11 sm:w-11 shrink-0"
        >
          <Send className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      </form>
    </div>
  );
}
