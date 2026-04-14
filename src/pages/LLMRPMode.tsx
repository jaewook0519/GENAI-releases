import * as Tabs from "@radix-ui/react-tabs";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { useLLMRPStore } from "@/stores/llm-rp-store";
import CharacterSheet from "@/components/llm-rp/CharacterSheet";
import WorldSettingPanel from "@/components/llm-rp/WorldSettingPanel";
import SystemPromptEditor from "@/components/llm-rp/SystemPromptEditor";
import PersonaList from "@/components/llm-rp/PersonaList";
import PromptLibrary from "@/components/llm-rp/PromptLibrary";
import JsonImportExport from "@/components/llm-rp/JsonImportExport";

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" />
    </svg>
  );
}

const tabTriggerClass = cn(
  "px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors",
  "border-b-2 border-transparent",
  "data-[state=active]:border-primary data-[state=active]:text-foreground",
  "hover:text-foreground"
);

export default function LLMRPMode() {
  const {
    characters,
    worlds,
    systemPrompts,
    activeCharacterId,
    activeWorldId,
    addCharacter,
    deleteCharacter,
    setActiveCharacter,
    addWorld,
    deleteWorld,
    setActiveWorld,
  } = useLLMRPStore();

  const activeCharacter = characters.find((c) => c.id === activeCharacterId);
  const activeWorld = worlds.find((w) => w.id === activeWorldId);
  const activeTemplate = systemPrompts[0] ?? null;

  return (
    <div className="flex h-full overflow-hidden">
      {/* 좌측 사이드바: 캐릭터 목록 */}
      <aside className="flex h-full w-56 shrink-0 flex-col border-r border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <span className="text-xs font-medium text-muted-foreground">캐릭터</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              addCharacter({
                name: "새 캐릭터",
                description: "",
                personality: "",
                speechPattern: "",
                background: "",
                exampleDialogs: [],
                tags: [],
              })
            }
          >
            <PlusIcon />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {characters.length === 0 ? (
            <p className="mt-4 text-center text-xs text-muted-foreground/60">
              + 버튼으로 캐릭터를 추가하세요
            </p>
          ) : (
            <div className="flex flex-col gap-1">
              {characters.map((c) => (
                <div
                  key={c.id}
                  className={cn(
                    "group flex items-center justify-between rounded-md px-2 py-1.5 cursor-pointer transition-colors",
                    activeCharacterId === c.id
                      ? "bg-primary/20 text-primary"
                      : "text-foreground hover:bg-secondary"
                  )}
                  onClick={() => setActiveCharacter(c.id)}
                >
                  <span className="truncate text-xs">{c.name || "(이름 없음)"}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteCharacter(c.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                  >
                    <TrashIcon />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* 메인 탭 영역 */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Tabs.Root defaultValue="character" className="flex flex-1 flex-col overflow-hidden">
          {/* 탭 헤더 */}
          <Tabs.List className="flex shrink-0 items-end border-b border-border px-4 pt-2 gap-1">
            <Tabs.Trigger value="character" className={tabTriggerClass}>
              캐릭터
            </Tabs.Trigger>
            <Tabs.Trigger value="world" className={tabTriggerClass}>
              세계관
            </Tabs.Trigger>
            <Tabs.Trigger value="prompt" className={tabTriggerClass}>
              시스템 프롬프트
            </Tabs.Trigger>
            <Tabs.Trigger value="persona" className={tabTriggerClass}>
              페르소나
            </Tabs.Trigger>
            <Tabs.Trigger value="json" className={tabTriggerClass}>
              JSON
            </Tabs.Trigger>
          </Tabs.List>

          {/* 캐릭터 탭 */}
          <Tabs.Content value="character" className="flex-1 overflow-hidden">
            {activeCharacter ? (
              <CharacterSheet key={activeCharacter.id} character={activeCharacter} />
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-muted-foreground">
                  왼쪽에서 캐릭터를 선택하거나 새로 추가하세요.
                </p>
              </div>
            )}
          </Tabs.Content>

          {/* 세계관 탭 */}
          <Tabs.Content value="world" className="flex-1 overflow-hidden">
            <div className="flex h-full">
              <div className="w-48 shrink-0 border-r border-border">
                <div className="flex items-center justify-between border-b border-border px-3 py-2">
                  <span className="text-xs text-muted-foreground">세계관</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      addWorld({ title: "새 세계관", description: "", lore: "", rules: [] })
                    }
                  >
                    <PlusIcon />
                  </Button>
                </div>
                <div className="overflow-y-auto p-2">
                  {worlds.map((w) => (
                    <div
                      key={w.id}
                      className={cn(
                        "group flex items-center justify-between rounded px-2 py-1.5 cursor-pointer text-xs transition-colors",
                        activeWorldId === w.id
                          ? "bg-primary/20 text-primary"
                          : "hover:bg-secondary text-foreground"
                      )}
                      onClick={() => setActiveWorld(w.id)}
                    >
                      <span className="truncate">{w.title}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteWorld(w.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  ))}
                  {worlds.length === 0 && (
                    <p className="mt-3 text-center text-xs text-muted-foreground/60">+ 추가</p>
                  )}
                </div>
              </div>
              <div className="flex-1 overflow-hidden">
                {activeWorld ? (
                  <WorldSettingPanel key={activeWorld.id} world={activeWorld} />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-sm text-muted-foreground">세계관을 선택하세요.</p>
                  </div>
                )}
              </div>
            </div>
          </Tabs.Content>

          {/* 시스템 프롬프트 탭 */}
          <Tabs.Content value="prompt" className="flex-1 overflow-hidden">
            <div className="flex h-full">
              <div className="flex-1 overflow-hidden">
                <SystemPromptEditor template={activeTemplate} />
              </div>
              <div className="w-56 shrink-0 border-l border-border overflow-y-auto p-3">
                <p className="mb-2 text-xs font-medium text-muted-foreground">라이브러리</p>
                <PromptLibrary onSelect={() => {}} selectedId={activeTemplate?.id} />
              </div>
            </div>
          </Tabs.Content>

          {/* 페르소나 탭 */}
          <Tabs.Content value="persona" className="flex-1 overflow-hidden">
            <PersonaList />
          </Tabs.Content>

          {/* JSON 탭 */}
          <Tabs.Content value="json" className="flex-1 overflow-hidden">
            <JsonImportExport />
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </div>
  );
}
