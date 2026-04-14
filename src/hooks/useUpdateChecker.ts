import { useEffect } from "react";
import { useUpdateStore } from "@/stores/update-store";

/**
 * 앱 시작 시 한 번 업데이트 체크.
 * App.tsx의 AppContent 안에서 호출.
 */
export function useUpdateChecker() {
  const { checkForUpdate } = useUpdateStore();

  useEffect(() => {
    // 약간 지연 후 체크 (앱 초기화 우선)
    const timer = setTimeout(() => {
      checkForUpdate();
    }, 3000);
    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}
