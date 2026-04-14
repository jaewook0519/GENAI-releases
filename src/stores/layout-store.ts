import { create } from "zustand";

type RightPanelContent = "generation" | "character" | "preset" | null;

interface LayoutState {
  rightPanelOpen: boolean;
  rightPanelContent: RightPanelContent;
  toggleRightPanel: (content: RightPanelContent) => void;
  closeRightPanel: () => void;
}

export const useLayoutStore = create<LayoutState>((set, get) => ({
  rightPanelOpen: false,
  rightPanelContent: null,

  toggleRightPanel: (content) => {
    const { rightPanelOpen, rightPanelContent } = get();
    if (rightPanelOpen && rightPanelContent === content) {
      set({ rightPanelOpen: false, rightPanelContent: null });
    } else {
      set({ rightPanelOpen: true, rightPanelContent: content });
    }
  },

  closeRightPanel: () => {
    set({ rightPanelOpen: false, rightPanelContent: null });
  },
}));
