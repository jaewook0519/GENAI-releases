import { create } from "zustand";

interface UpdateState {
  available: boolean;
  version: string | null;
  releaseNotes: string | null;
  installing: boolean;
  dismissed: boolean;

  checkForUpdate(): Promise<void>;
  installUpdate(): Promise<void>;
  dismiss(): void;
}

export const useUpdateStore = create<UpdateState>((set) => ({
  available: false,
  version: null,
  releaseNotes: null,
  installing: false,
  dismissed: false,

  checkForUpdate: async () => {
    try {
      // Tauri updater plugin — only available in Tauri context
      const { check } = await import("@tauri-apps/plugin-updater");
      const update = await check();
      if (update) {
        set({
          available: true,
          version: update.version,
          releaseNotes: update.body ?? null,
        });
      }
    } catch {
      // Ignore errors (browser dev mode, no network, etc.)
    }
  },

  installUpdate: async () => {
    set({ installing: true });
    try {
      const { check } = await import("@tauri-apps/plugin-updater");
      const update = await check();
      if (update) {
        // downloadAndInstall 완료 후 Tauri가 자동으로 앱 재시작
        await update.downloadAndInstall();
      }
    } catch (e) {
      console.error("업데이트 설치 실패:", e);
      set({ installing: false });
    }
  },

  dismiss: () => set({ dismissed: true }),
}));
