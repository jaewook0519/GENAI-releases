import { cn } from "@/lib/cn";
import { useLLMRPStore } from "@/stores/llm-rp-store";

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" />
    </svg>
  );
}

interface Props {
  /** 라이브러리에서 템플릿을 선택했을 때 콜백 */
  onSelect: (templateId: string) => void;
  selectedId?: string;
}

export default function PromptLibrary({ onSelect, selectedId }: Props) {
  const { systemPrompts, deleteSystemPrompt } = useLLMRPStore();

  if (systemPrompts.length === 0) {
    return (
      <div className="rounded-md border border-border bg-secondary/30 p-4 text-center text-xs text-muted-foreground">
        저장된 프롬프트 템플릿이 없습니다.
        <br />
        편집기에서 저장 버튼을 눌러 추가하세요.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      {systemPrompts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "flex items-center gap-2 rounded-md border p-2 cursor-pointer transition-colors",
            selectedId === t.id
              ? "border-primary bg-primary/10"
              : "border-border bg-secondary/50 hover:bg-secondary"
          )}
          onClick={() => onSelect(t.id)}
        >
          <div className="flex-1 min-w-0">
            <p className="truncate text-xs font-medium text-foreground">{t.name || "(이름 없음)"}</p>
            <p className="truncate text-[10px] text-muted-foreground">
              {t.content.slice(0, 60)}...
            </p>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              deleteSystemPrompt(t.id);
            }}
            className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
          >
            <TrashIcon />
          </button>
        </div>
      ))}
    </div>
  );
}
