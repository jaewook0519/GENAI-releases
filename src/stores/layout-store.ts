import { create } from "zustand";
import { persist } from "zustand/middleware";

interface LayoutState {
  leftPanelOpen: boolean;
  rightPanelOpen: boolean;
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  setLeftPanel: (open: boolean) => void;
  setRightPanel: (open: boolean) => void;
}

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set) => ({
      leftPanelOpen: true,
      rightPanelOpen: true,

      toggleLeftPanel: () => set((s) => ({ leftPanelOpen: !s.leftPanelOpen })),
      toggleRightPanel: () => set((s) => ({ rightPanelOpen: !s.rightPanelOpen })),
      setLeftPanel: (open) => set({ leftPanelOpen: open }),
      setRightPanel: (open) => set({ rightPanelOpen: open }),
    }),
    { name: "genai-layout" }
  )
);
