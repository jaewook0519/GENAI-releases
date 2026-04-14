import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { GenerationSettings } from "@/stores/settings-store";

export interface Scene {
  id: string;
  name: string;
  prompt: string;
  negativePrompt: string;
  params: Partial<GenerationSettings>;
  count: number;
  enabled: boolean;
  lastResultBase64?: string;
}

export interface BatchProgress {
  done: number;
  total: number;
  currentSceneId: string | null;
}

interface SceneState {
  scenes: Scene[];
  batchProgress: BatchProgress;
  isRunning: boolean;
  _stopRequested: boolean;

  addScene(): void;
  removeScene(id: string): void;
  updateScene(id: string, patch: Partial<Scene>): void;
  reorderScenes(from: number, to: number): void;
  startBatch(): void;
  stopBatch(): void;
  setBatchProgress(progress: Partial<BatchProgress>): void;
  setRunning(running: boolean): void;
  setSceneResult(id: string, base64: string): void;
}

export const useSceneStore = create<SceneState>()(
  persist(
    (set, get) => ({
      scenes: [],
      batchProgress: { done: 0, total: 0, currentSceneId: null },
      isRunning: false,
      _stopRequested: false,

      addScene: () => {
        const { scenes } = get();
        const newScene: Scene = {
          id: crypto.randomUUID(),
          name: `Scene ${scenes.length + 1}`,
          prompt: "",
          negativePrompt: "",
          params: {},
          count: 1,
          enabled: true,
        };
        set((s) => ({ scenes: [...s.scenes, newScene] }));
      },

      removeScene: (id) =>
        set((s) => ({ scenes: s.scenes.filter((sc) => sc.id !== id) })),

      updateScene: (id, patch) =>
        set((s) => ({
          scenes: s.scenes.map((sc) => (sc.id === id ? { ...sc, ...patch } : sc)),
        })),

      reorderScenes: (from, to) => {
        const { scenes } = get();
        const result = [...scenes];
        const [moved] = result.splice(from, 1);
        result.splice(to, 0, moved);
        set({ scenes: result });
      },

      startBatch: () => set({ isRunning: true, _stopRequested: false }),

      stopBatch: () =>
        set({ _stopRequested: true, isRunning: false, batchProgress: { done: 0, total: 0, currentSceneId: null } }),

      setBatchProgress: (progress) =>
        set((s) => ({ batchProgress: { ...s.batchProgress, ...progress } })),

      setRunning: (running) => set({ isRunning: running }),

      setSceneResult: (id, base64) =>
        set((s) => ({
          scenes: s.scenes.map((sc) =>
            sc.id === id ? { ...sc, lastResultBase64: base64 } : sc
          ),
        })),
    }),
    {
      name: "genai-scenes",
      // 실행 상태는 퍼시스트하지 않음
      partialize: (s) => ({ scenes: s.scenes }),
    }
  )
);
