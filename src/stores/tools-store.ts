import { create } from "zustand";

export type ToolType = "img2img" | "inpaint" | "upscale" | "bgremove" | "mosaic" | "taganalysis";

interface ToolsState {
  activeTool: ToolType;
  inputBase64: string | null;
  outputBase64: string | null;
  isProcessing: boolean;
  error: string | null;

  // img2img params
  strength: number;
  upscaleScale: 2 | 4;

  setActiveTool(tool: ToolType): void;
  setInputBase64(base64: string | null): void;
  setOutputBase64(base64: string | null): void;
  setProcessing(v: boolean): void;
  setError(msg: string | null): void;
  setStrength(v: number): void;
  setUpscaleScale(v: 2 | 4): void;
  reset(): void;
}

export const useToolsStore = create<ToolsState>((set) => ({
  activeTool: "img2img",
  inputBase64: null,
  outputBase64: null,
  isProcessing: false,
  error: null,
  strength: 0.6,
  upscaleScale: 4,

  setActiveTool: (tool) => set({ activeTool: tool, outputBase64: null, error: null }),
  setInputBase64: (base64) => set({ inputBase64: base64, outputBase64: null, error: null }),
  setOutputBase64: (base64) => set({ outputBase64: base64 }),
  setProcessing: (v) => set({ isProcessing: v }),
  setError: (msg) => set({ error: msg, isProcessing: false }),
  setStrength: (v) => set({ strength: v }),
  setUpscaleScale: (v) => set({ upscaleScale: v }),
  reset: () => set({ inputBase64: null, outputBase64: null, error: null, isProcessing: false }),
}));
