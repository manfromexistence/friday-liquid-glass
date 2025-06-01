import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { GoogleGenAI } from "@google/genai";

interface Message {
  id: string;
  content: string;
  role: "user" | "model";
  responseTime?: number; // in seconds
}

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const getAIResponse = async (userMessage: string) => {
    try {
      const ai = new GoogleGenAI({ apiKey: "AIzaSyC9uEv9VcBB_jTMEd5T81flPXFMzuaviy0" });
      const config = {
        responseMimeType: "text/plain",
      };
      const model = "learnlm-2.0-flash-experimental";
      const contents = [
        ...messages.map(msg => ({
          role: msg.role,
          parts: [{ text: msg.content }],
        })),
        {
          role: "user",
          parts: [{ text: userMessage }],
        },
      ];

      const startTime = performance.now();
      const response = await ai.models.generateContentStream({
        model,
        config,
        contents,
      });

      const tempMessageId = crypto.randomUUID();
      setMessages(prev => [...prev, { id: tempMessageId, content: "", role: "model", responseTime: undefined }]);
      let fullResponse = "";

      for await (const chunk of response) {
        fullResponse += chunk.text || "";
        setMessages(prev =>
          prev.map(msg =>
            msg.id === tempMessageId ? { ...msg, content: fullResponse } : msg
          )
        );
      }

      const endTime = performance.now();
      const responseTime = (endTime - startTime) / 1000;

      setMessages(prev =>
        prev.map(msg =>
          msg.id === tempMessageId ? { ...msg, responseTime } : msg
        )
      );

      return fullResponse;
    } catch (error) {
      console.error("Error fetching AI response:", error);
      return "Sorry, there was an error processing your request.";
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      content: input,
      role: "user",
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsStreaming(true);

    await getAIResponse(input);
    setIsStreaming(false);
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <Card className="w-full max-w-2xl mx-auto h-[600px] flex flex-col bg-background border-border">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Bot className="h-6 w-6" />
          AI Chatbot
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4">
        <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex mb-4",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[70%] p-3 rounded-lg",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                )}
              >
                {message.role === "user" && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {message.content}
                  </div>
                )}
                {message.role === "model" && (
                  <div>
                    <div>{message.content}</div>
                    {message.responseTime !== undefined && (
                      <div className="text-sm text-muted-foreground mt-1">
                        Response time: {message.responseTime.toFixed(2)} seconds
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isStreaming && (
            <div className="flex justify-start mb-4">
              <div className="bg-muted text-foreground p-3 rounded-lg">
                Typing...
              </div>
            </div>
          )}
        </ScrollArea>
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="bg-background text-foreground border-border placeholder:text-muted-foreground"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}