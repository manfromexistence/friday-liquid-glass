'use client';

import { create } from 'zustand';

interface BackgroundState {
  backgroundSrc: string | null;
  fileType: 'image' | 'video' | null;
  isLoading: boolean;
  setFile: (file: File | null) => void;
  clearBackground: () => void;
}

export const useBackgroundStore = create<BackgroundState>((set, get) => ({
  backgroundSrc: null,
  fileType: null,
  isLoading: false,
  setFile: async (file) => {
    const currentSrc = get().backgroundSrc;
    if (currentSrc && currentSrc.startsWith('blob:')) {
      URL.revokeObjectURL(currentSrc);
    }

    if (!file) {
      set({ backgroundSrc: null, fileType: null, isLoading: false });
      return;
    }

    set({ isLoading: true, backgroundSrc: null, fileType: null });

    const fileType = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : null;

    if (!fileType) {
      alert('Unsupported file type. Please select an image or video.');
      set({ isLoading: false });
      return;
    }

    const objectURL = URL.createObjectURL(file);

    if (fileType === 'video') {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        if (video.duration > 60) {
          alert('Video duration must be 1 minute or less.');
          URL.revokeObjectURL(objectURL);
          set({ isLoading: false });
        } else {
          set({ backgroundSrc: objectURL, fileType: 'video', isLoading: false });
        }
      };
      video.onerror = () => {
        alert('Failed to load video metadata.');
        URL.revokeObjectURL(objectURL);
        set({ isLoading: false });
      };
      video.src = objectURL;
    } else {
      set({ backgroundSrc: objectURL, fileType: 'image', isLoading: false });
    }
  },
  clearBackground: () => {
    const currentSrc = get().backgroundSrc;
    if (currentSrc && currentSrc.startsWith('blob:')) {
      URL.revokeObjectURL(currentSrc);
    }
    set({ backgroundSrc: null, fileType: null, isLoading: false });
  },
}));
