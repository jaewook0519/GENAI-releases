import { useState } from "react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { useLLMRPStore, type SystemPromptTemplate } from "@/stores/llm-rp-store";

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

const fieldClass = cn(
  "w-full rounded-md border border-border bg-secondary",
  "px-2.5 py-2 text-xs text-foreground placeholder:text-muted-foreground",
  "focus:outline-none focus:ring-1 focus:ring-ring resize-none"
);

const VARIABLES = [
  "{{character.name}}",
  "{{character.description}}",
  "{{character.personality}}",
  "{{character.speechPattern}}",
  "{{character.background}}",
  "{{world.title}}",
  "{{world.description}}",
  "{{world.lore}}",
];

interface Props {
  template: SystemPromptTemplate | null;
}

export default function SystemPromptEditor({ template }: Props) {
  const { addSystemPrompt, updateSystemPrompt, activeCharacterId, buildFinalPrompt } =
    useLLMRPStore();

  const [name, setName] = useState(template?.name ?? "");
  const [content, setContent] = useState(template?.content ?? "");
  const [copied, setCopied] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const builtPrompt = activeCharacterId ? buildFinalPrompt(activeCharacterId) : "";

  const save = () => {
    if (template) {
      updateSystemPrompt(template.id, { name, content });
    } else {
      addSystemPrompt({ name, content, variables: [] });
    }
  };

  const insertVariable = (variable: string) => {
    setContent((prev) => prev + variable);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 클립보드 접근 실패
    }
  };

  return (
    <div className="flex flex-col gap-4 overflow-y-auto p-4">
      {/* 템플릿 이름 */}
      <div>
        <label className="mb-1 block text-xs text-muted-foreground">템플릿 이름</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={cn(fieldClass, "h-8")}
          placeholder="템플릿 이름"
        />
      </div>

      {/* 변수 삽입 버튼 */}
      <div>
        <p className="mb-1.5 text-xs text-muted-foreground">변수 삽입</p>
        <div className="flex flex-wrap gap-1">
          {VARIABLES.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => insertVariable(v)}
              className="rounded border border-border bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* 템플릿 콘텐츠 */}
      <div>
        <label className="mb-1 block text-xs text-muted-foreground">시스템 프롬프트 내용</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={10}
          className={fieldClass}
          placeholder="당신은 {{character.name}}입니다.&#10;{{character.description}}&#10;&#10;성격: {{character.personality}}"
        />
      </div>

      {/* 액션 버튼 */}
      <div className="flex gap-2">
        <Button className="flex-1" onClick={save}>
          저장
        </Button>
        <Button
          variant="outline"
          className="flex-1 gap-1.5"
          onClick={() => copyToClipboard(content)}
        >
          <CopyIcon />
          {copied ? "복사됨!" : "템플릿 복사"}
        </Button>
      </div>

      <div className="h-px bg-border" />

      {/* 최종 프롬프트 미리보기 */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">최종 프롬프트 미리보기</span>
          <button
            type="button"
            onClick={() => setPreviewOpen((v) => !v)}
            className="text-xs text-primary hover:underline"
          >
            {previewOpen ? "접기" : "펼치기"}
          </button>
        </div>

        {previewOpen && (
          <div className="rounded-md border border-border bg-secondary/50 p-3">
            {activeCharacterId ? (
              <>
                <pre className="whitespace-pre-wrap text-xs text-foreground leading-relaxed">
                  {builtPrompt || "(빌드 결과가 없습니다)"}
                </pre>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 gap-1"
                  onClick={() => copyToClipboard(builtPrompt)}
                >
                  <CopyIcon />
                  {copied ? "복사됨!" : "클립보드 복사"}
                </Button>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">
                왼쪽에서 캐릭터를 선택하면 미리보기가 표시됩니다.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
