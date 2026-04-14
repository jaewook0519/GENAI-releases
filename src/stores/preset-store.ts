import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useSettingsStore, type GenerationSettings } from "@/stores/settings-store";

export interface Preset {
  id: string;
  name: string;
  params: GenerationSettings;
}

interface PresetState {
  presets: Preset[];
  addPreset(name: string, params: GenerationSettings): void;
  removePreset(id: string): void;
  applyPreset(id: string): void;
}

export const usePresetStore = create<PresetState>()(
  persist(
    (set, get) => ({
      presets: [],

      addPreset: (name, params) => {
        const preset: Preset = { id: crypto.randomUUID(), name, params };
        set((s) => ({ presets: [...s.presets, preset] }));
      },

      removePreset: (id) =>
        set((s) => ({ presets: s.presets.filter((p) => p.id !== id) })),

      applyPreset: (id) => {
        const preset = get().presets.find((p) => p.id === id);
        if (!preset) return;
        useSettingsStore.getState().update(preset.params);
      },
    }),
    { name: "genai-presets" }
  )
);
