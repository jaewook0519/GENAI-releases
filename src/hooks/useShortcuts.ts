import { useEffect } from "react";
import { useFragmentStore } from "@/stores/fragment-store";
import { useSettingsStore } from "@/stores/settings-store";

/**
 * 전역 키보드 단축키 처리
 * - Ctrl+1~9: shortcutIndex가 일치하는 Fragment를 현재 프롬프트 끝에 삽입
 */
export function useShortcuts() {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ctrl(Windows) / Cmd(Mac) + 숫자키 1–9
      const isModifier = e.ctrlKey || e.metaKey;
      if (!isModifier) return;

      const num = parseInt(e.key, 10);
      if (isNaN(num) || num < 1 || num > 9) return;

      // 텍스트 입력 요소에 포커스 중이면 단축키 삽입 우선권을 기본 동작에 양보
      const active = document.activeElement;
      const isTextInput =
        active instanceof HTMLTextAreaElement ||
        (active instanceof HTMLInputElement && active.type !== "checkbox" && active.type !== "radio");

      if (isTextInput) return;

      e.preventDefault();

      const fragments = useFragmentStore.getState().fragments;
      const fragment = fragments.find((f) => f.shortcutIndex === num);
      if (!fragment) return;

      const { prompt, update } = useSettingsStore.getState();
      const separator = prompt.length > 0 && !prompt.endsWith(", ") ? ", " : "";
      update({ prompt: prompt + separator + fragment.content });
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);
}
