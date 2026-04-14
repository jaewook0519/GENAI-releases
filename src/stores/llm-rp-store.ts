import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface RPCharacter {
  id: string;
  name: string;
  description: string;
  personality: string;
  speechPattern: string;
  background: string;
  exampleDialogs: { user: string; char: string }[];
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export interface WorldSetting {
  id: string;
  title: string;
  description: string;
  lore: string;
  rules: string[];
}

export interface SystemPromptTemplate {
  id: string;
  name: string;
  content: string;
  variables: string[];
  shortcutIndex?: number;
}

export interface Persona {
  id: string;
  name: string;
  description: string;
  isDefault: boolean;
}

export interface RPConfig {
  version: "1.0";
  character: RPCharacter;
  world?: WorldSetting;
  systemPrompt?: SystemPromptTemplate;
  persona?: Persona;
  exportedAt: number;
}

interface LLMRPState {
  characters: RPCharacter[];
  worlds: WorldSetting[];
  systemPrompts: SystemPromptTemplate[];
  personas: Persona[];

  activeCharacterId: string | null;
  activeWorldId: string | null;
  activePersonaId: string | null;

  // Character CRUD
  addCharacter(c: Omit<RPCharacter, "id" | "createdAt" | "updatedAt">): void;
  updateCharacter(id: string, patch: Partial<RPCharacter>): void;
  deleteCharacter(id: string): void;

  // World CRUD
  addWorld(w: Omit<WorldSetting, "id">): void;
  updateWorld(id: string, patch: Partial<WorldSetting>): void;
  deleteWorld(id: string): void;

  // SystemPrompt CRUD
  addSystemPrompt(t: Omit<SystemPromptTemplate, "id">): void;
  updateSystemPrompt(id: string, patch: Partial<SystemPromptTemplate>): void;
  deleteSystemPrompt(id: string): void;

  // Persona CRUD
  addPersona(p: Omit<Persona, "id">): void;
  updatePersona(id: string, patch: Partial<Persona>): void;
  deletePersona(id: string): void;
  setActivePersona(id: string): void;

  // Setters
  setActiveCharacter(id: string | null): void;
  setActiveWorld(id: string | null): void;

  // JSON 직렬화
  exportConfig(characterId: string): RPConfig;
  importConfig(config: RPConfig): void;

  // 프롬프트 조합
  buildFinalPrompt(characterId: string): string;
}

function resolveVariables(
  template: string,
  character: RPCharacter,
  world: WorldSetting | undefined
): string {
  return template
    .replace(/\{\{character\.name\}\}/g, character.name)
    .replace(/\{\{character\.description\}\}/g, character.description)
    .replace(/\{\{character\.personality\}\}/g, character.personality)
    .replace(/\{\{character\.speechPattern\}\}/g, character.speechPattern)
    .replace(/\{\{character\.background\}\}/g, character.background)
    .replace(/\{\{world\.description\}\}/g, world?.description ?? "")
    .replace(/\{\{world\.title\}\}/g, world?.title ?? "")
    .replace(/\{\{world\.lore\}\}/g, world?.lore ?? "");
}

export const useLLMRPStore = create<LLMRPState>()(
  persist(
    (set, get) => ({
      characters: [],
      worlds: [],
      systemPrompts: [],
      personas: [],
      activeCharacterId: null,
      activeWorldId: null,
      activePersonaId: null,

      addCharacter: (c) => {
        const char: RPCharacter = {
          ...c,
          id: crypto.randomUUID(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set((s) => ({
          characters: [...s.characters, char],
          activeCharacterId: char.id,
        }));
      },

      updateCharacter: (id, patch) =>
        set((s) => ({
          characters: s.characters.map((c) =>
            c.id === id ? { ...c, ...patch, updatedAt: Date.now() } : c
          ),
        })),

      deleteCharacter: (id) =>
        set((s) => ({
          characters: s.characters.filter((c) => c.id !== id),
          activeCharacterId:
            s.activeCharacterId === id
              ? (s.characters.find((c) => c.id !== id)?.id ?? null)
              : s.activeCharacterId,
        })),

      addWorld: (w) => {
        const world: WorldSetting = { ...w, id: crypto.randomUUID() };
        set((s) => ({
          worlds: [...s.worlds, world],
          activeWorldId: world.id,
        }));
      },

      updateWorld: (id, patch) =>
        set((s) => ({
          worlds: s.worlds.map((w) => (w.id === id ? { ...w, ...patch } : w)),
        })),

      deleteWorld: (id) =>
        set((s) => ({
          worlds: s.worlds.filter((w) => w.id !== id),
          activeWorldId:
            s.activeWorldId === id
              ? (s.worlds.find((w) => w.id !== id)?.id ?? null)
              : s.activeWorldId,
        })),

      addSystemPrompt: (t) => {
        const tmpl: SystemPromptTemplate = { ...t, id: crypto.randomUUID() };
        set((s) => ({ systemPrompts: [...s.systemPrompts, tmpl] }));
      },

      updateSystemPrompt: (id, patch) =>
        set((s) => ({
          systemPrompts: s.systemPrompts.map((t) =>
            t.id === id ? { ...t, ...patch } : t
          ),
        })),

      deleteSystemPrompt: (id) =>
        set((s) => ({
          systemPrompts: s.systemPrompts.filter((t) => t.id !== id),
        })),

      addPersona: (p) => {
        const persona: Persona = { ...p, id: crypto.randomUUID() };
        set((s) => ({
          personas: [...s.personas, persona],
          activePersonaId: persona.isDefault ? persona.id : s.activePersonaId,
        }));
      },

      updatePersona: (id, patch) =>
        set((s) => ({
          personas: s.personas.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        })),

      deletePersona: (id) =>
        set((s) => ({
          personas: s.personas.filter((p) => p.id !== id),
          activePersonaId:
            s.activePersonaId === id
              ? (s.personas.find((p) => p.id !== id)?.id ?? null)
              : s.activePersonaId,
        })),

      setActivePersona: (id) => set({ activePersonaId: id }),
      setActiveCharacter: (id) => set({ activeCharacterId: id }),
      setActiveWorld: (id) => set({ activeWorldId: id }),

      exportConfig: (characterId) => {
        const { characters, worlds, systemPrompts, personas, activeWorldId, activePersonaId } =
          get();
        const character = characters.find((c) => c.id === characterId);
        if (!character) throw new Error("캐릭터를 찾을 수 없습니다.");

        return {
          version: "1.0",
          character,
          world: worlds.find((w) => w.id === activeWorldId),
          systemPrompt: systemPrompts[0],
          persona: personas.find((p) => p.id === activePersonaId),
          exportedAt: Date.now(),
        };
      },

      importConfig: (config) => {
        const { characters, worlds, systemPrompts, personas } = get();

        const charExists = characters.some((c) => c.id === config.character.id);
        const newChar = charExists
          ? { ...config.character, id: crypto.randomUUID() }
          : config.character;

        const updates: Partial<LLMRPState> = {
          characters: charExists ? [...characters, newChar] : [...characters, newChar],
          activeCharacterId: newChar.id,
        };

        if (config.world) {
          const worldExists = worlds.some((w) => w.id === config.world!.id);
          const newWorld = worldExists
            ? { ...config.world, id: crypto.randomUUID() }
            : config.world;
          updates.worlds = [...worlds, newWorld];
          updates.activeWorldId = newWorld.id;
        }

        if (config.systemPrompt) {
          const tmplExists = systemPrompts.some((t) => t.id === config.systemPrompt!.id);
          const newTmpl = tmplExists
            ? { ...config.systemPrompt, id: crypto.randomUUID() }
            : config.systemPrompt;
          updates.systemPrompts = [...systemPrompts, newTmpl];
        }

        if (config.persona) {
          const personaExists = personas.some((p) => p.id === config.persona!.id);
          const newPersona = personaExists
            ? { ...config.persona, id: crypto.randomUUID() }
            : config.persona;
          updates.personas = [...personas, newPersona];
          updates.activePersonaId = newPersona.id;
        }

        set(updates);
      },

      buildFinalPrompt: (characterId) => {
        const { characters, worlds, systemPrompts, activeWorldId } = get();
        const character = characters.find((c) => c.id === characterId);
        if (!character) return "";

        const world = worlds.find((w) => w.id === activeWorldId);
        const template = systemPrompts[0];

        if (template) {
          return resolveVariables(template.content, character, world);
        }

        // 기본 프롬프트 포맷
        const lines = [
          `이름: ${character.name}`,
          character.description ? `\n설명:\n${character.description}` : "",
          character.personality ? `\n성격:\n${character.personality}` : "",
          character.speechPattern ? `\n말투:\n${character.speechPattern}` : "",
          character.background ? `\n배경:\n${character.background}` : "",
          world ? `\n세계관:\n${world.description}` : "",
        ];

        return lines.filter(Boolean).join("");
      },
    }),
    { name: "genai-llm-rp" }
  )
);
