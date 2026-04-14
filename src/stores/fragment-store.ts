import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Fragment {
  id: string;
  name: string;
  content: string;
  color?: string;
  shortcutIndex?: number; // 1–9
}

interface FragmentState {
  fragments: Fragment[];
  addFragment(f: Omit<Fragment, "id">): void;
  updateFragment(id: string, patch: Partial<Fragment>): void;
  deleteFragment(id: string): void;
  getByShortcut(index: number): Fragment | undefined;
}

export const useFragmentStore = create<FragmentState>()(
  persist(
    (set, get) => ({
      fragments: [],

      addFragment: (f) => {
        const fragment: Fragment = { ...f, id: crypto.randomUUID() };
        set((s) => ({ fragments: [...s.fragments, fragment] }));
      },

      updateFragment: (id, patch) =>
        set((s) => ({
          fragments: s.fragments.map((f) => (f.id === id ? { ...f, ...patch } : f)),
        })),

      deleteFragment: (id) =>
        set((s) => ({ fragments: s.fragments.filter((f) => f.id !== id) })),

      getByShortcut: (index) =>
        get().fragments.find((f) => f.shortcutIndex === index),
    }),
    { name: "genai-fragments" }
  )
);
