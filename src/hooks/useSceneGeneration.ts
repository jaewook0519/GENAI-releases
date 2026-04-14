import { useEffect, useRef } from "react";
import { useSceneStore } from "@/stores/scene-store";
import { useSettingsStore } from "@/stores/settings-store";
import { generateImage } from "@/services/novelai-api";
import { extractImageFromZip } from "@/services/smart-tools";

export function useSceneGeneration() {
  const abortRef = useRef<AbortController | null>(null);

  // runBatch를 ref에 저장 — 매 렌더마다 최신 상태를 참조하면서도 useEffect deps 경고 없이 사용
  const runBatchRef = useRef<() => Promise<void>>(async () => {});

  runBatchRef.current = async () => {
    const settings = useSettingsStore.getState();
    const { scenes, setBatchProgress, setRunning, setSceneResult } =
      useSceneStore.getState();

    const enabledScenes = scenes.filter((sc) => sc.enabled);
    const total = enabledScenes.reduce((sum, sc) => sum + sc.count, 0);
    let done = 0;

    setBatchProgress({ done: 0, total, currentSceneId: null });

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      for (const scene of enabledScenes) {
        if (useSceneStore.getState()._stopRequested) break;

        setBatchProgress({ currentSceneId: scene.id });

        for (let i = 0; i < scene.count; i++) {
          if (useSceneStore.getState()._stopRequested) break;

          const merged = {
            ...settings,
            ...scene.params,
            prompt: scene.prompt || settings.prompt,
            negativePrompt: scene.negativePrompt || settings.negativePrompt,
          };

          const seed =
            (merged.seed ?? null) === null
              ? Math.floor(Math.random() * 4_294_967_295)
              : (merged.seed as number);

          try {
            const zip = await generateImage(
              {
                model: merged.model,
                prompt: merged.prompt,
                negativePrompt: merged.negativePrompt,
                width: merged.width,
                height: merged.height,
                steps: merged.steps,
                cfgScale: merged.cfgScale,
                sampler: merged.sampler,
                seed,
                noiseSchedule: merged.noiseSchedule,
                qualityToggle: merged.qualityToggle,
                smea: merged.smea,
                smeaDyn: merged.smeaDyn,
              },
              controller.signal
            );
            const base64 = await extractImageFromZip(zip);
            setSceneResult(scene.id, base64);
          } catch (err) {
            if (controller.signal.aborted) return;
            console.error(`Scene "${scene.name}" 생성 실패:`, err);
          }

          done++;
          setBatchProgress({ done });
        }
      }
    } finally {
      abortRef.current = null;
      setRunning(false);
      setBatchProgress({ currentSceneId: null });
    }
  };

  // isRunning이 false → true 로 바뀌면 배치 실행
  useEffect(() => {
    const unsubscribe = useSceneStore.subscribe((state, prev) => {
      if (state.isRunning && !prev.isRunning) {
        runBatchRef.current();
      }
    });
    return unsubscribe;
  }, []);

  // 언마운트 시 진행 중인 배치 중단
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);
}
