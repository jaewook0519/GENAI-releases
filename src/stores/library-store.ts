import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { GenerationParams } from "@/services/novelai-api";

export interface LibraryImage {
  id: string;
  base64: string;
  params: GenerationParams;
  createdAt: number;
  tool?: string; // 'generate' | 'img2img' | 'upscale' | 'bgremove'
}

interface LibraryState {
  images: LibraryImage[];
  selectedId: string | null;

  addImage(img: Omit<LibraryImage, "id" | "createdAt">): void;
  deleteImage(id: string): void;
  selectImage(id: string | null): void;
  clearAll(): void;
}

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set) => ({
      images: [],
      selectedId: null,

      addImage: (img) => {
        const entry: LibraryImage = {
          ...img,
          id: crypto.randomUUID(),
          createdAt: Date.now(),
        };
        // 최신 이미지가 맨 앞에 오도록 prepend
        set((s) => ({ images: [entry, ...s.images], selectedId: entry.id }));
      },

      deleteImage: (id) =>
        set((s) => ({
          images: s.images.filter((img) => img.id !== id),
          selectedId: s.selectedId === id ? null : s.selectedId,
        })),

      selectImage: (id) => set({ selectedId: id }),

      clearAll: () => set({ images: [], selectedId: null }),
    }),
    { name: "genai-library" }
  )
);
