import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { useLLMRPStore } from "@/stores/llm-rp-store";
import { CheckIcon, TrashIcon } from "@/components/ui/icons";

export default function PersonaList() {
  const { personas, activePersonaId, addPersona, updatePersona, deletePersona, setActivePersona } =
    useLLMRPStore();

  const handleAdd = () => {
    addPersona({
      name: "새 페르소나",
      description: "",
      isDefault: personas.length === 0,
    });
  };

  return (
    <div className="flex flex-col gap-3 overflow-y-auto p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">페르소나 목록</span>
        <Button variant="outline" size="sm" onClick={handleAdd}>
          + 추가
        </Button>
      </div>

      {personas.length === 0 ? (
        <div className="rounded-md border border-border bg-secondary/30 p-6 text-center">
          <p className="text-sm text-muted-foreground">페르소나가 없습니다.</p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            페르소나는 RP에서 사용자 자신의 역할을 정의합니다.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {personas.map((p) => (
            <div
              key={p.id}
              className={cn(
                "rounded-md border p-3 cursor-pointer transition-colors",
                activePersonaId === p.id
                  ? "border-primary bg-primary/10"
                  : "border-border bg-secondary/50 hover:bg-secondary"
              )}
              onClick={() => setActivePersona(p.id)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <input
                    value={p.name}
                    onChange={(e) => updatePersona(p.id, { name: e.target.value })}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full bg-transparent text-sm font-medium text-foreground focus:outline-none"
                    placeholder="페르소나 이름"
                  />
                  <textarea
                    value={p.description}
                    onChange={(e) => updatePersona(p.id, { description: e.target.value })}
                    onClick={(e) => e.stopPropagation()}
                    rows={2}
                    className="mt-1 w-full resize-none bg-transparent text-xs text-muted-foreground focus:outline-none"
                    placeholder="페르소나 설명..."
                  />
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {activePersonaId === p.id && (
                    <span className="text-primary">
                      <CheckIcon />
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePersona(p.id);
                    }}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={p.isDefault}
                    onChange={(e) => updatePersona(p.id, { isDefault: e.target.checked })}
                    onClick={(e) => e.stopPropagation()}
                    className="rounded"
                  />
                  기본 페르소나
                </label>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
