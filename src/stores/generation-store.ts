import { create } from "zustand";
import { generateImage, NovelAIAPIError, type GenerationParams } from "@/services/novelai-api";
import { extractImageFromZip } from "@/services/smart-tools";
import { useLibraryStore } from "@/stores/library-store";

export interface GeneratedImage {
  id: string;
  base64: string;
  params: GenerationParams;
  createdAt: number;
}

interface GenerationState {
  isGenerating: boolean;
  previewBase64: string | null;
  lastImage: GeneratedImage | null;
  lastUsedSeed: number | null;
  error: string | null;
  _abortController: AbortController | null;

  /** seed가 null이면 랜덤 시드 자동 생성 */
  generate: (params: Omit<GenerationParams, "seed"> & { seed: number | null }) => Promise<void>;
  cancel: () => void;
  clearError: () => void;
}

export const useGenerationStore = create<GenerationState>((set, get) => ({
  isGenerating: false,
  previewBase64: null,
  lastImage: null,
  lastUsedSeed: null,
  error: null,
  _abortController: null,

  generate: async (settingsParams) => {
    if (get().isGenerating) return;

    const actualSeed =
      settingsParams.seed ?? Math.floor(Math.random() * 4_294_967_295);

    // seed 필드를 number 타입으로 교체 (null 제거)
    const params: GenerationParams = {
      model: settingsParams.model,
      prompt: settingsParams.prompt,
      negativePrompt: settingsParams.negativePrompt,
      width: settingsParams.width,
      height: settingsParams.height,
      steps: settingsParams.steps,
      cfgScale: settingsParams.cfgScale,
      sampler: settingsParams.sampler,
      noiseSchedule: settingsParams.noiseSchedule,
      qualityToggle: settingsParams.qualityToggle,
      smea: settingsParams.smea,
      smeaDyn: settingsParams.smeaDyn,
      seed: actualSeed,
    };
    const controller = new AbortController();

    set({ isGenerating: true, error: null, _abortController: controller });

    try {
      const zip = await generateImage(params, controller.signal);
      const base64 = await extractImageFromZip(zip);
      const image: GeneratedImage = {
        id: crypto.randomUUID(),
        base64,
        params,
        createdAt: Date.now(),
      };
      set({
        isGenerating: false,
        previewBase64: base64,
        lastImage: image,
        lastUsedSeed: actualSeed,
        _abortController: null,
      });
      // 라이브러리에 자동 저장
      useLibraryStore.getState().addImage({ base64, params, tool: "generate" });
    } catch (err) {
      if (controller.signal.aborted) {
        set({ isGenerating: false, _abortController: null });
        return;
      }
      let message = "알 수 없는 오류가 발생했습니다.";
      if (err instanceof NovelAIAPIError) {
        if (err.status === 401) {
          message = "토큰이 유효하지 않습니다. 설정에서 토큰을 확인해주세요.";
        } else if (err.status === 402) {
          message = "Anlas가 부족합니다.";
        } else {
          message = `생성 실패 (${err.status}): ${err.message}`;
        }
      } else if (err instanceof Error) {
        message = err.message;
      }
      set({ isGenerating: false, error: message, _abortController: null });
    }
  },

  cancel: () => {
    const { _abortController } = get();
    if (_abortController) {
      _abortController.abort();
    }
  },

  clearError: () => set({ error: null }),
}));
