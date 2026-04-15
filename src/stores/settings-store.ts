import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { NovelAIModel, Sampler } from "@/services/novelai-api";

export interface GenerationSettings {
  model: NovelAIModel;
  prompt: string;
  negativePrompt: string;
  width: number;
  height: number;
  steps: number;
  cfgScale: number;
  sampler: Sampler;
  seed: number | null; // null = 매 생성마다 랜덤
  noiseSchedule: string;
  qualityToggle: boolean;
  smea: boolean;
  smeaDyn: boolean;
}

interface SettingsState extends GenerationSettings {
  geminiApiKey: string;
  update: (patch: Partial<GenerationSettings>) => void;
  setGeminiApiKey: (key: string) => void;
}

export const DEFAULT_NEGATIVE_PROMPT =
  "lowres, {bad}, error, fewer, extra, missing, worst quality, jpeg artifacts, bad quality, watermark, unfinished, displeasing, chromatic aberration, signature, extra digits, artistic error, username, scan, [abstract]";

export const RESOLUTION_PRESETS: { label: string; width: number; height: number }[] = [
  { label: "832×1216 (Portrait)", width: 832, height: 1216 },
  { label: "1216×832 (Landscape)", width: 1216, height: 832 },
  { label: "1024×1024 (Square)", width: 1024, height: 1024 },
  { label: "1024×1536 (Portrait L)", width: 1024, height: 1536 },
  { label: "1536×1024 (Landscape L)", width: 1536, height: 1024 },
  { label: "1568×672 (Wide)", width: 1568, height: 672 },
  { label: "672×1568 (Tall)", width: 672, height: 1568 },
];

export const MODEL_LABELS: Record<NovelAIModel, string> = {
  "nai-diffusion-4-5": "NAI Diffusion v4.5",
  "nai-diffusion-4-5-curated": "NAI Diffusion v4.5 Curated",
  "nai-diffusion-4": "NAI Diffusion v4",
  "nai-diffusion-4-curated-preview": "NAI Diffusion v4 Curated",
  "nai-diffusion-3": "NAI Diffusion v3",
  "nai-diffusion-3-inpainting": "NAI Diffusion v3 Inpainting",
};

export const SAMPLER_LABELS: Record<Sampler, string> = {
  k_euler: "Euler",
  k_euler_ancestral: "Euler Ancestral",
  k_dpmpp_2s_ancestral: "DPM++ 2S Ancestral",
  k_dpmpp_2m: "DPM++ 2M",
  k_dpmpp_sde: "DPM++ SDE",
  ddim_v3: "DDIM v3",
};

export const NOISE_SCHEDULES = ["karras", "exponential", "polyexponential", "native"] as const;

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      model: "nai-diffusion-4-5",
      prompt: "",
      negativePrompt: "",
      width: 832,
      height: 1216,
      steps: 28,
      cfgScale: 5,
      sampler: "k_euler_ancestral",
      seed: null,
      noiseSchedule: "karras",
      qualityToggle: true,
      smea: false,
      smeaDyn: false,
      geminiApiKey: "",
      update: (patch) => set((s) => ({ ...s, ...patch })),
      setGeminiApiKey: (key) => set({ geminiApiKey: key }),
    }),
    {
      name: "genai-settings",
      version: 2,
      migrate: (persisted, version) => {
        const state = persisted as Partial<GenerationSettings>;
        // v1 → v2: clear the pre-filled DEFAULT_NEGATIVE_PROMPT
        if (version < 2 && state.negativePrompt === DEFAULT_NEGATIVE_PROMPT) {
          state.negativePrompt = "";
        }
        return state;
      },
    }
  )
);
