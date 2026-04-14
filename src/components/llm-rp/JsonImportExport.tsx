import { useState } from "react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { useLLMRPStore, type RPConfig } from "@/stores/llm-rp-store";

const fieldClass = cn(
  "w-full rounded-md border border-border bg-secondary",
  "px-2.5 py-2 text-xs text-foreground placeholder:text-muted-foreground",
  "focus:outline-none focus:ring-1 focus:ring-ring resize-none font-mono"
);

export default function JsonImportExport() {
  const { characters, activeCharacterId, exportConfig, importConfig } = useLLMRPStore();

  const [exportTargetId, setExportTargetId] = useState(activeCharacterId ?? "");
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState("");
  const [importSuccess, setImportSuccess] = useState(false);
  const [exportCopied, setExportCopied] = useState(false);

  const handleExportCopy = async () => {
    if (!exportTargetId) return;
    try {
      const config = exportConfig(exportTargetId);
      const json = JSON.stringify(config, null, 2);
      await navigator.clipboard.writeText(json);
      setExportCopied(true);
      setTimeout(() => setExportCopied(false), 2000);
    } catch (err) {
      console.error("내보내기 실패:", err);
    }
  };

  const handleExportDownload = () => {
    if (!exportTargetId) return;
    try {
      const config = exportConfig(exportTargetId);
      const json = JSON.stringify(config, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const char = characters.find((c) => c.id === exportTargetId);
      a.href = url;
      a.download = `${char?.name ?? "character"}_rp_config.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("다운로드 실패:", err);
    }
  };

  const handleImport = () => {
    setImportError("");
    setImportSuccess(false);

    try {
      const parsed = JSON.parse(importText) as RPConfig;

      if (parsed.version !== "1.0") {
        setImportError(
          `지원되지 않는 버전입니다: ${parsed.version}. 버전 1.0만 지원합니다.`
        );
        return;
      }

      if (!parsed.character || !parsed.character.name) {
        setImportError("캐릭터 데이터가 없거나 형식이 올바르지 않습니다.");
        return;
      }

      importConfig(parsed);
      setImportSuccess(true);
      setImportText("");
      setTimeout(() => setImportSuccess(false), 3000);
    } catch {
      setImportError("JSON 파싱 오류입니다. 올바른 JSON 형식인지 확인하세요.");
    }
  };

  return (
    <div className="flex flex-col gap-6 overflow-y-auto p-4">
      {/* 내보내기 */}
      <section>
        <h3 className="mb-3 text-sm font-medium text-foreground">내보내기</h3>

        <div className="mb-3">
          <label className="mb-1 block text-xs text-muted-foreground">캐릭터 선택</label>
          <select
            value={exportTargetId}
            onChange={(e) => setExportTargetId(e.target.value)}
            className={cn(
              "h-8 w-full rounded-md border border-border bg-secondary",
              "px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            )}
          >
            <option value="">캐릭터를 선택하세요</option>
            {characters.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            disabled={!exportTargetId}
            onClick={handleExportCopy}
          >
            {exportCopied ? "복사됨!" : "클립보드 복사"}
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            disabled={!exportTargetId}
            onClick={handleExportDownload}
          >
            파일 저장
          </Button>
        </div>
      </section>

      <div className="h-px bg-border" />

      {/* 가져오기 */}
      <section>
        <h3 className="mb-3 text-sm font-medium text-foreground">가져오기</h3>

        <div className="mb-3">
          <label className="mb-1 block text-xs text-muted-foreground">
            JSON 붙여넣기
          </label>
          <textarea
            value={importText}
            onChange={(e) => {
              setImportText(e.target.value);
              setImportError("");
            }}
            rows={8}
            className={fieldClass}
            placeholder={'{\n  "version": "1.0",\n  "character": { ... }\n}'}
          />
        </div>

        {importError && (
          <div className="mb-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {importError}
          </div>
        )}

        {importSuccess && (
          <div className="mb-3 rounded-md border border-primary/40 bg-primary/10 px-3 py-2 text-xs text-primary">
            캐릭터를 성공적으로 가져왔습니다!
          </div>
        )}

        <Button
          className="w-full"
          disabled={!importText.trim()}
          onClick={handleImport}
        >
          가져오기
        </Button>
      </section>
    </div>
  );
}
