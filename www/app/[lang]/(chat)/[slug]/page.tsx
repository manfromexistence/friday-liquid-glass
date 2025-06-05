"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import LoadingAnimation from "@/components/chat/loading-animation";
import { db } from "@/lib/db";
import { chats as chatsTable } from "@/lib/db/schema";
import { authClient } from "@/lib/auth/auth-client";
import { toast } from "sonner";
import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useCategorySidebar } from "@/components/layout/sidebar/category-sidebar";
import { useSubCategorySidebar } from "@/components/layout/sidebar/subcategory-sidebar";
import { aiService } from "@/lib/services/ai-service";
import { useAutoResizeTextarea } from "@/hooks/use-auto-resize-textarea";
import {MessageList} from "@/components/chat/message-list";
import { ChatInput } from "@/components/chat/chat-input";
import { useQueryClient } from "@tanstack/react-query";
import type { Message } from "@/types/chat";
import { cn } from "@/lib/utils";

const MIN_HEIGHT = 48;
const MAX_HEIGHT = 164;

function sanitizeForFirestore(obj: any): any {
  if (obj === null || obj === undefined) {
    return null;
  }

  if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj
      .filter(item => item !== undefined && item !== null)
      .map(item => sanitizeForFirestore(item));
  }

  if (obj instanceof Date) {
    return obj.toISOString();
  }

  if (typeof obj === 'object') {
    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value === undefined) continue;
      const sanitizedValue = sanitizeForFirestore(value);
      if (
        sanitizedValue === null ||
        typeof sanitizedValue === 'string' ||
        typeof sanitizedValue === 'number' ||
        typeof sanitizedValue === 'boolean' ||
        Array.isArray(sanitizedValue) ||
        (typeof sanitizedValue === 'object' && sanitizedValue !== null)
      ) {
        sanitized[key] = sanitizedValue;
      } else {
        console.warn(`Invalid value type for key ${key}: ${typeof sanitizedValue}. Skipping.`);
      }
    }
    return sanitized;
  }

  console.error(`Unsupported type: ${typeof obj}. Skipping.`);
  return null;
}

function validateMessage(message: Message): boolean {
  if (typeof message.id !== 'string' || message.id.length === 0) return false;
  if (message.role !== 'user' && message.role !== 'assistant') return false;
  if (typeof message.content !== 'string') return false;
  if (typeof message.timestamp !== 'string') return false;
  if (message.image_urls) { // Updated from image_ids to image_urls
    if (!Array.isArray(message.image_urls)) return false;
    for (const url of message.image_urls) {
      if (typeof url !== 'string') return false;
    }
  }
  if (message.reasoning) {
    if (typeof message.reasoning !== 'object' || message.reasoning === null) return false;
    if (typeof message.reasoning.thinking !== 'string' || typeof message.reasoning.answer !== 'string') return false;
  }
  return true;
}

interface AIResponse {
  text_response: string; // Updated to match ImageGenResponse from ai-service.ts
  image_urls: string[];  // Changed from image_ids to image_urls
  model_used: string;
}

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

type Params = {
  slug: string;
};

export default function ChatPage() {
  const router = useRouter();
  const [user, setUser] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const params = useParams<Params>() ?? { slug: "" };
  const chatId = params.slug;
  const queryClient = useQueryClient();
  const { statecategorysidebar } = useCategorySidebar();
  const { statesubcategorysidebar } = useSubCategorySidebar();
  // Use Zustand stores for state management
  const { currentModel, setModel } = useAIModelStore();
  const { 
    value, setValue,
    inputHeight, setInputHeight,
    showSearch, setShowSearch, toggleSearch,
    showResearch, setShowResearch, toggleResearch,
    showThinking, setShowThinking, toggleThinking,
    imagePreview, setImagePreview,
    chatState, setChatState
  } = useChatInputStore();

  // Local state for session-specific variables
  const messagesEndRef = useRef<HTMLDivElement>(null as unknown as HTMLDivElement);
  const [sessionId, setSessionId] = React.useState<string>(params.slug);
  const [initialResponseGenerated, setInitialResponseGenerated] = React.useState(false);
  const [isValidating, setIsValidating] = React.useState(true);

  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: MIN_HEIGHT,
    maxHeight: MAX_HEIGHT,
  });

  // Fetch user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const sessionData = await authClient.getSession();
        setUser(sessionData?.data);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, []);

  // Fetch chat data from Turso/Drizzle
  useEffect(() => {
    if (!chatId) return;
    const fetchChat = async () => {
      try {
        const chatRows = await db.select().from(chatsTable).where(chatsTable.id.eq(chatId));
        if (chatRows.length > 0) {
          const chat = chatRows[0];
          const messages = Array.isArray(chat.messages) ? chat.messages : JSON.parse(chat.messages);
          useChatInputStore.getState().setChatState({
            ...chatState,
            messages,
          });
          if (chat.model && currentModel !== chat.model) {
            setModel(chat.model);
          }
        }
      } catch (error) {
        console.error("Error fetching chat:", error);
        useChatInputStore.getState().setError("Failed to load chat");
        toast.error("Failed to load chat");
      }
    };
    fetchChat();
    // Optionally, set up polling for updates or use a subscription if available
  }, [chatId, currentModel, setModel]);

  useEffect(() => {
    const shouldGenerateResponse = sessionStorage.getItem("autoSubmit") === "true";
    const storedModel = sessionStorage.getItem("selectedAI");

    if (
      shouldGenerateResponse &&
      sessionId &&
      chatState.messages.length > 0 &&
      !initialResponseGenerated &&
      !chatState.isLoading
    ) {
      const generateInitialResponse = async () => {
        try {
          // Use Zustand's setLoading directly
          useChatInputStore.getState().setLoading(true);
          sessionStorage.removeItem("autoSubmit");
          sessionStorage.removeItem("initialPrompt");
          setInitialResponseGenerated(true);

          const lastMessage = chatState.messages[chatState.messages.length - 1];
          if (lastMessage.role !== "user") {
            useChatInputStore.getState().setLoading(false);
            return;
          }

          // Update to use Zustand setModel
          if (storedModel) {
            setModel(storedModel);
          }

          const aiResponse = await aiService.generateResponse(lastMessage.content);
          console.log("Raw aiResponse (initial):", aiResponse);

          const assistantMessageBase = {
            id: crypto.randomUUID(),
            role: "assistant" as const,
            content: typeof aiResponse === "string" ? aiResponse : aiResponse.text_response,
            timestamp: new Date().toISOString(),
          };

          const assistantMessage: Message = {
            ...assistantMessageBase,
            ...(typeof aiResponse !== "string" && aiResponse.image_urls?.length > 0
              ? { image_urls: aiResponse.image_urls.filter(url => typeof url === "string") } 
              : {}),
            ...(typeof aiResponse === "string" && lastMessage.content.includes("reasoning")
              ? { reasoning: { thinking: "Processing...", answer: aiResponse } }
              : {}),
          };

          const sanitizedMessage = sanitizeForFirestore(assistantMessage);
          if (!validateMessage(sanitizedMessage)) {
            throw new Error("Invalid assistant message structure");
          }

          const chatRef = doc(db, "chats", sessionId);
          console.log("Saving initial response:", { messages: arrayUnion(sanitizedMessage), updatedAt: Timestamp.fromDate(new Date()) });
          await updateDoc(chatRef, {
            messages: arrayUnion(sanitizedMessage),
            updatedAt: Timestamp.fromDate(new Date()),
          });

          // Use Zustand's setLoading directly
          useChatInputStore.getState().setLoading(false);
        } catch (error) {
          console.error("Error generating initial response:", error);
          // Use Zustand's setLoading and setError actions
          useChatInputStore.getState().setLoading(false);
          useChatInputStore.getState().setError("Failed to generate AI response");
          toast.error("Failed to generate initial AI response");
        }
      };

      generateInitialResponse();
    }
  }, [sessionId, chatState.messages, initialResponseGenerated, chatState.isLoading, setModel]);

  const handleSubmit = async () => {
    if (!value.trim() || !chatId || chatState.isLoading) return;
    if (!user || !user.user) {
      toast.error("Authentication required", {
        description: "Please sign in to chat with Friday AI",
        duration: 5000,
      });
      return;
    }
    try {
      useChatInputStore.getState().setLoading(true);
      useChatInputStore.getState().setError(null);
      const processedValue = stripPrefixes(value.trim());
      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: processedValue,
        timestamp: new Date().toISOString(),
      };
      const sanitizedUserMessage = sanitizeForFirestore(userMessage);
      if (!validateMessage(sanitizedUserMessage)) {
        throw new Error("Invalid user message structure");
      }
      // Fetch current chat messages
      const chatRows = await db.select().from(chatsTable).where(chatsTable.id.eq(chatId));
      if (chatRows.length === 0) {
        throw new Error("Chat not found");
      }
      const chat = chatRows[0];
      const messages = Array.isArray(chat.messages) ? chat.messages : JSON.parse(chat.messages);
      const updatedMessages = [...messages, sanitizedUserMessage];
      await db.update(chatsTable)
        .set({
          messages: JSON.stringify(updatedMessages),
          updatedAt: new Date().toISOString(),
        })
        .where(chatsTable.id.eq(chatId));
      setValue("");
      // Optionally, trigger AI response here (see ai-input for pattern)
      // ...existing code for AI response...
    } catch (error) {
      console.error("Error submitting message:", error);
      useChatInputStore.getState().setLoading(false);
      useChatInputStore.getState().setError("Failed to send message");
      toast.error("Failed to send message");
    }
  };

  const handleURLAnalysis = async (
    urls: string[],
    prompt: string,
    type: string = "url_analysis"
  ): Promise<void> => {
    try {
      // Use Zustand's setLoading and setError actions directly
      useChatInputStore.getState().setLoading(true);
      useChatInputStore.getState().setError(null);

      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: `Analyze this: ${urls.join(", ")} ${prompt ? `\n\n${prompt}` : ""}`,
        timestamp: new Date().toISOString(),
      };

      const sanitizedUserMessage = sanitizeForFirestore(userMessage);
      if (!validateMessage(sanitizedUserMessage)) {
        throw new Error("Invalid user message structure for URL analysis");
      }

      const chatRef = doc(db, "chats", sessionId);
      console.log("Saving user message for URL analysis:", { messages: arrayUnion(sanitizedUserMessage), updatedAt: Timestamp.fromDate(new Date()) });
      await updateDoc(chatRef, {
        messages: arrayUnion(sanitizedUserMessage),
        updatedAt: Timestamp.fromDate(new Date()),
      });

      setValue("");
      if (textareaRef.current) {
        textareaRef.current.style.height = `${MIN_HEIGHT}px`;
      }

      const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/analyze_media_from_url`;
      const payload = { urls, prompt };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const responseData = await response.json();

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: responseData.response || responseData.text || "Analysis complete.",
        timestamp: new Date().toISOString(),
      };

      const sanitizedMessage = sanitizeForFirestore(assistantMessage);
      if (!validateMessage(sanitizedMessage)) {
        throw new Error("Invalid assistant message structure for URL analysis");
      }

      console.log("Saving URL analysis message:", { messages: arrayUnion(sanitizedMessage), updatedAt: Timestamp.fromDate(new Date()) });
      await updateDoc(chatRef, {
        messages: arrayUnion(sanitizedMessage),
        updatedAt: Timestamp.fromDate(new Date()),
      });

      // Use Zustand's setLoading directly
      useChatInputStore.getState().setLoading(false);
    } catch (error) {
      console.error("Error in URL analysis:", error);
      // Use Zustand's setLoading and setError actions
      useChatInputStore.getState().setLoading(false);
      useChatInputStore.getState().setError(error instanceof Error ? error.message : "Failed to analyze URL content");
      toast.error("Failed to analyze content");
    }
  };

  // Add AI generation function using the AI service
  const handleAIGenerate = useCallback(async (prompt: string, messages: any[] = []) => {
    try {
      // Use Zustand's setLoading directly
      useChatInputStore.getState().setLoading(true);
      
      // Call AI service to generate response
      const aiResponse = await aiService.generateResponse(prompt);
      
      // Process response
      const formattedResponse = typeof aiResponse === "string" 
        ? aiResponse 
        : aiResponse.text_response;
      
      // Use Zustand's setLoading directly
      useChatInputStore.getState().setLoading(false);
      
      return formattedResponse;
    } catch (error) {
      console.error("Error generating AI response:", error);
      // Use Zustand's setLoading and setError actions
      useChatInputStore.getState().setLoading(false);
      useChatInputStore.getState().setError("Failed to generate AI response");
      toast.error("Failed to generate AI response");
      return null;
    }
  }, []);

  const handleAdjustHeight = useCallback(
    (reset = false) => {
      if (!textareaRef.current) return;

      if (reset) {
        textareaRef.current.style.height = `${MIN_HEIGHT}px`;
        setInputHeight(MIN_HEIGHT);
        return;
      }

      const scrollHeight = textareaRef.current.scrollHeight;
      const newHeight = Math.min(scrollHeight, MAX_HEIGHT);
      textareaRef.current.style.height = `${newHeight}px`;
      
      // Update input height in Zustand store
      setInputHeight(newHeight);
    },
    [textareaRef, setInputHeight]
  );

  // if (!user) {
  //   return <LoadingAnimation />;
  // }

  return (
    <div
      className={cn(
        "relative flex min-h-full w-full flex-col transition-all duration-200 ease-linear"
      )}
    >
      {chatState.error && (
        <div className="bg-destructive/90 absolute inset-x-0 top-0 z-50 p-2 text-center text-sm">
          {chatState.error}
        </div>
      )}
      <MessageList
        chatId={sessionId}
        messages={chatState.messages}
        messagesEndRef={messagesEndRef}
        isThinking={chatState.isLoading}
        selectedAI={currentModel}
      />      <ChatInput
        className="absolute bottom-4 left-1/2 z-50 -translate-x-1/2 md:bottom-2"
        value={value}
        chatState={chatState}
        setChatState={setChatState}
        showSearch={showSearch}
        showResearch={showResearch}
        showThinking={showThinking}
        imagePreview={imagePreview}
        inputHeight={inputHeight}
        textareaRef={textareaRef as React.RefObject<HTMLTextAreaElement>}
        onSubmit={handleSubmit}
        onChange={setValue}
        onHeightChange={handleAdjustHeight}
        onSearchToggle={toggleSearch}
        onResearchToggle={toggleResearch}
        onThinkingToggle={toggleThinking}
        onUrlAnalysis={handleURLAnalysis}
        onAIGenerate={handleAIGenerate}
        onImageChange={(file) => 
          setImagePreview(file ? URL.createObjectURL(file) : null)
        }
      />
    </div>
  );
}