// Zustand store for chat input states
import { create } from 'zustand'
import type { Message } from '../types/chat'

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

interface ChatInputStore {
  value: string;
  setValue: (v: string) => void;

  isMaxHeight: boolean;
  setIsMaxHeight: (v: boolean) => void;

  isLoggingIn: boolean;
  setIsLoggingIn: (v: boolean) => void;

  inputHeight: number;
  setInputHeight: (v: number) => void;

  showSearch: boolean;
  setShowSearch: (v: boolean) => void;

  showResearch: boolean;
  setShowResearch: (v: boolean) => void;

  showThinking: boolean;
  setShowThinking: (v: boolean) => void;

  imagePreview: string | null;
  setImagePreview: (v: string | null) => void;

  chatState: ChatState;
  setChatState: (v: ChatState) => void;
}

export const useChatInputStore = create<ChatInputStore>((set) => ({
  value: '',
  setValue: (v) => set({ value: v }),

  isMaxHeight: false,
  setIsMaxHeight: (v) => set({ isMaxHeight: v }),

  isLoggingIn: false,
  setIsLoggingIn: (v) => set({ isLoggingIn: v }),

  inputHeight: 48,
  setInputHeight: (v) => set({ inputHeight: v }),

  showSearch: false,
  setShowSearch: (v) => set({ showSearch: v }),

  showResearch: false,
  setShowResearch: (v) => set({ showResearch: v }),

  showThinking: false,
  setShowThinking: (v) => set({ showThinking: v }),

  imagePreview: null,
  setImagePreview: (v) => set({ imagePreview: v }),

  chatState: {
    messages: [],
    isLoading: false,
    error: null,
  },
  setChatState: (v) => set({ chatState: v }),
}))
