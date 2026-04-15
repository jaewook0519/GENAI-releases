import { useState } from "react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { useLLMRPStore, type WorldSetting } from "@/stores/llm-rp-store";
import { PlusIcon, TrashIcon } from "@/components/ui/icons";

const fieldClass = cn(
  "w-full rounded-md border border-border bg-secondary",
  "px-2.5 py-2 text-xs text-foreground placeholder:text-muted-foreground",
  "focus:outline-none focus:ring-1 focus:ring-ring resize-none"
);

interface Props {
  world: WorldSetting;
}

export default function WorldSettingPanel({ world }: Props) {
  const { updateWorld } = useLLMRPStore();
  const [draft, setDraft] = useState<WorldSetting>(world);

  if (draft.id !== world.id) {
    setDraft(world);
  }

  const update = (patch: Partial<WorldSetting>) =>
    setDraft((prev) => ({ ...prev, ...patch }));

  const addRule = () => update({ rules: [...draft.rules, ""] });

  const updateRule = (idx: number, value: string) =>
    update({ rules: draft.rules.map((r, i) => (i === idx ? value : r)) });

  const removeRule = (idx: number) =>
    update({ rules: draft.rules.filter((_, i) => i !== idx) });

  const save = () => updateWorld(draft.id, draft);

  return (
    <div className="flex flex-col gap-4 overflow-y-auto p-4">
      <div>
        <label className="mb-1 block text-xs text-muted-foreground">세계관 제목</label>
        <input
          value={draft.title}
          onChange={(e) => update({ title: e.target.value })}
          className={cn(fieldClass, "h-8")}
          placeholder="세계관 이름"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs text-muted-foreground">설명</label>
        <textarea
          value={draft.description}
          onChange={(e) => update({ description: e.target.value })}
          rows={3}
          className={fieldClass}
          placeholder="세계관의 기본 설명..."
        />
      </div>

      <div>
        <label className="mb-1 block text-xs text-muted-foreground">상세 세계관 (Lore)</label>
        <textarea
          value={draft.lore}
          onChange={(e) => update({ lore: e.target.value })}
          rows={5}
          className={fieldClass}
          placeholder="역사, 문화, 지리 등 세부 설정..."
        />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">세계 규칙</span>
          <Button variant="ghost" size="sm" onClick={addRule} className="gap-1">
            <PlusIcon /> 추가
          </Button>
        </div>
        <div className="flex flex-col gap-1.5">
          {draft.rules.map((rule, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <input
                value={rule}
                onChange={(e) => updateRule(i, e.target.value)}
                className={cn(fieldClass, "h-8 flex-1")}
                placeholder={`규칙 ${i + 1}`}
              />
              <button
                type="button"
                onClick={() => removeRule(i)}
                className="text-muted-foreground hover:text-destructive transition-colors"
              >
                <TrashIcon />
              </button>
            </div>
          ))}
          {draft.rules.length === 0 && (
            <p className="text-center text-xs text-muted-foreground/50 py-2">
              규칙을 추가하세요.
            </p>
          )}
        </div>
      </div>

      <Button className="w-full" onClick={save}>
        저장
      </Button>
    </div>
  );
}
