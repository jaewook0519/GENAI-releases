import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { SpinnerIcon } from "@/components/ui/icons";
import type { ToolType } from "@/stores/tools-store";

interface ResultPanelProps {
  base64: string | null;
  isProcessing: boolean;
  error: string | null;
  onSaveToLibrary: () => void;
  tool: ToolType;
}

export default function ResultPanel({ base64, isProcessing, error, onSaveToLibrary }: ResultPanelProps) {
  const handleDownload = () => {
    if (!base64) return;
    const a = document.createElement("a");
    a.href = `data:image/png;base64,${base64}`;
    a.download = `genai_${Date.now()}.png`;
    a.click();
  };

  return (
    <div className="flex flex-col gap-2">
      <div className={cn(
        "flex aspect-square items-center justify-center rounded-lg border border-border bg-secondary/30",
        "overflow-hidden"
      )}>
        {isProcessing ? (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <SpinnerIcon />
            <span className="text-xs">처리 중...</span>
          </div>
        ) : error ? (
          <div className="p-4 text-center text-xs text-destructive">{error}</div>
        ) : base64 ? (
          <img
            src={`data:image/png;base64,${base64}`}
            alt="결과"
            className="h-full w-full object-contain"
            draggable={false}
          />
        ) : (
          <span className="text-xs text-muted-foreground">결과가 여기 표시됩니다</span>
        )}
      </div>
      {base64 && !isProcessing && (
        <div className="flex gap-2">
          <Button size="sm" className="flex-1" onClick={onSaveToLibrary}>
            라이브러리 저장
          </Button>
          <Button size="sm" variant="outline" className="flex-1" onClick={handleDownload}>
            다운로드
          </Button>
        </div>
      )}
    </div>
  );
}
