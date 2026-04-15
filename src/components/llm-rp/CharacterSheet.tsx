import { useState } from "react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { useLLMRPStore, type RPCharacter } from "@/stores/llm-rp-store";
import { PlusIcon, TrashIcon } from "@/components/ui/icons";

const fieldClass = cn(
  "w-full rounded-md border border-border bg-secondary",
  "px-2.5 py-2 text-xs text-foreground placeholder:text-muted-foreground",
  "focus:outline-none focus:ring-1 focus:ring-ring resize-none"
);

interface Props {
  character: RPCharacter;
}

export default function CharacterSheet({ character }: Props) {
  const { updateCharacter } = useLLMRPStore();
  const [draft, setDraft] = useState<RPCharacter>(character);

  // 캐릭터가 바뀌면 draft 초기화
  if (draft.id !== character.id) {
    setDraft(character);
  }

  const save = () => updateCharacter(draft.id, draft);

  const update = (patch: Partial<RPCharacter>) =>
    setDraft((prev) => ({ ...prev, ...patch }));

  const addDialog = () =>
    update({ exampleDialogs: [...draft.exampleDialogs, { user: "", char: "" }] });

  const removeDialog = (idx: number) =>
    update({
      exampleDialogs: draft.exampleDialogs.filter((_, i) => i !== idx),
    });

  const updateDialog = (
    idx: number,
    field: "user" | "char",
    value: string
  ) => {
    const updated = draft.exampleDialogs.map((d, i) =>
      i === idx ? { ...d, [field]: value } : d
    );
    update({ exampleDialogs: updated });
  };

  return (
    <div className="flex flex-col gap-4 overflow-y-auto p-4">
      {/* 이름 + 태그 */}
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="mb-1 block text-xs text-muted-foreground">이름</label>
          <input
            value={draft.name}
            onChange={(e) => update({ name: e.target.value })}
            className={cn(fieldClass, "h-8")}
            placeholder="캐릭터 이름"
          />
        </div>
        <div className="w-40">
          <label className="mb-1 block text-xs text-muted-foreground">태그 (쉼표 구분)</label>
          <input
            value={draft.tags.join(", ")}
            onChange={(e) =>
              update({ tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })
            }
            className={cn(fieldClass, "h-8")}
            placeholder="태그1, 태그2"
          />
        </div>
      </div>

      {/* 설명 */}
      <div>
        <label className="mb-1 block text-xs text-muted-foreground">외모 / 설명</label>
        <textarea
          value={draft.description}
          onChange={(e) => update({ description: e.target.value })}
          rows={3}
          className={fieldClass}
          placeholder="캐릭터의 외모와 기본 설명..."
        />
      </div>

      {/* 성격 */}
      <div>
        <label className="mb-1 block text-xs text-muted-foreground">성격</label>
        <textarea
          value={draft.personality}
          onChange={(e) => update({ personality: e.target.value })}
          rows={3}
          className={fieldClass}
          placeholder="성격, 특징, 기질..."
        />
      </div>

      {/* 말투 */}
      <div>
        <label className="mb-1 block text-xs text-muted-foreground">말투 / 어조</label>
        <textarea
          value={draft.speechPattern}
          onChange={(e) => update({ speechPattern: e.target.value })}
          rows={2}
          className={fieldClass}
          placeholder="대화체, 어미, 특유의 표현..."
        />
      </div>

      {/* 배경 */}
      <div>
        <label className="mb-1 block text-xs text-muted-foreground">배경 설정</label>
        <textarea
          value={draft.background}
          onChange={(e) => update({ background: e.target.value })}
          rows={3}
          className={fieldClass}
          placeholder="과거, 직업, 세계관 내 위치..."
        />
      </div>

      {/* 대화 예시 */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">대화 예시</span>
          <Button variant="ghost" size="sm" onClick={addDialog} className="gap-1">
            <PlusIcon /> 추가
          </Button>
        </div>
        <div className="flex flex-col gap-2">
          {draft.exampleDialogs.map((d, i) => (
            <div key={i} className="rounded-md border border-border bg-secondary/50 p-2">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">대화 #{i + 1}</span>
                <button
                  type="button"
                  onClick={() => removeDialog(i)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <TrashIcon />
                </button>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex gap-1 items-start">
                  <span className="w-8 shrink-0 text-[10px] text-muted-foreground pt-1.5">사용자</span>
                  <textarea
                    value={d.user}
                    onChange={(e) => updateDialog(i, "user", e.target.value)}
                    rows={2}
                    className={cn(fieldClass, "flex-1")}
                  />
                </div>
                <div className="flex gap-1 items-start">
                  <span className="w-8 shrink-0 text-[10px] text-muted-foreground pt-1.5">캐릭터</span>
                  <textarea
                    value={d.char}
                    onChange={(e) => updateDialog(i, "char", e.target.value)}
                    rows={2}
                    className={cn(fieldClass, "flex-1")}
                  />
                </div>
              </div>
            </div>
          ))}
          {draft.exampleDialogs.length === 0 && (
            <p className="text-center text-xs text-muted-foreground/50 py-2">
              대화 예시가 없습니다. 추가 버튼을 눌러 추가하세요.
            </p>
          )}
        </div>
      </div>

      {/* 저장 */}
      <Button className="w-full" onClick={save}>
        저장
      </Button>
    </div>
  );
}
