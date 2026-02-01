"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@/hooks/useChat";
import { useVoice } from "@/hooks/useVoice";
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";

export function VoiceChat() {
  const { messages, handleSubmit, isLoading } = useChat();
  const { speak, stop, isPlaying } = useVoice();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<string>("");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (
      lastMessage &&
      lastMessage.role === "assistant" &&
      lastMessage.content !== lastMessageRef.current
    ) {
      lastMessageRef.current = lastMessage.content;
      speak(lastMessage.content);
    }
  }, [messages, speak]);

  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event: any) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + " ";
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(finalTranscript || interimTranscript);

        if (finalTranscript) {
          const formEvent = {
            preventDefault: () => {},
          } as React.FormEvent;

          const input = finalTranscript.trim();
          if (input) {
            (handleSubmit as any)(formEvent, input);
            setTranscript("");
            setIsListening(false);
            recognition.stop();
          }
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [handleSubmit]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      stop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
      stop();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-3 sm:space-y-4 mb-3 sm:mb-4 px-1">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground py-6 sm:py-8 px-4">
            <p className="text-base sm:text-lg font-medium">Voice Chat Mode</p>
            <p className="text-xs sm:text-sm mt-2">
              Tap the microphone to start talking with the AI assistant.
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
        {isPlaying && (
          <div className="flex justify-start">
            <div className="max-w-[85%] sm:max-w-[80%] rounded-lg px-3 py-2 sm:px-4 sm:py-2.5 bg-blue-100 dark:bg-blue-900">
              <p className="text-sm text-muted-foreground">Speaking...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex flex-col items-center gap-3 sm:gap-4 px-1">
        {transcript && (
          <div className="w-full p-2.5 sm:p-3 bg-muted rounded-lg">
            <p className="text-xs sm:text-sm text-center break-words">{transcript}</p>
          </div>
        )}
        <Button
          size="lg"
          onClick={toggleListening}
          disabled={isLoading}
          className={`rounded-full w-20 h-20 sm:w-24 sm:h-24 ${
            isListening
              ? "bg-red-500 hover:bg-red-600"
              : "bg-primary hover:bg-primary/90"
          }`}
        >
          {isListening ? (
            <MicOff className="h-8 w-8 sm:h-10 sm:w-10" />
          ) : (
            <Mic className="h-8 w-8 sm:h-10 sm:w-10" />
          )}
        </Button>
        <p className="text-sm sm:text-base text-muted-foreground font-medium">
          {isListening ? "Listening..." : "Tap to speak"}
        </p>
      </div>
    </div>
  );
}
