import { useLibraryStore } from "@/stores/library-store";
import { useGenerationStore } from "@/stores/generation-store";
import { cn } from "@/lib/cn";

function HistoryIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M3 3v5h5" /><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

export default function HistoryPanel() {
  const { images, selectedId, selectImage } = useLibraryStore();
  const { generate } = useGenerationStore();
  const recent = images.slice(0, 30);

  const handleDownload = (e: React.MouseEvent, img: typeof images[0]) => {
    e.stopPropagation();
    const a = document.createElement("a");
    a.href = `data:image/png;base64,${img.base64}`;
    a.download = `genai_${img.id}.png`;
    a.click();
  };

  const handleCopy = async (e: React.MouseEvent, img: typeof images[0]) => {
    e.stopPropagation();
    try {
      const res = await fetch(`data:image/png;base64,${img.base64}`);
      const blob = await res.blob();
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    } catch {
      // ignore
    }
  };

  const handleRegenerate = (e: React.MouseEvent, img: typeof images[0]) => {
    e.stopPropagation();
    generate({ ...img.params });
  };

  return (
    <div className="flex h-full flex-col">
      {/* 헤더 */}
      <div className="flex h-10 shrink-0 items-center gap-1.5 border-b border-white/5 px-3">
        <HistoryIcon />
        <span className="text-xs font-medium text-muted-foreground">히스토리</span>
        {images.length > 0 && (
          <span className="ml-auto rounded-full bg-white/5 px-1.5 py-0.5 text-[10px] text-muted-foreground">
            {images.length}
          </span>
        )}
      </div>

      {/* 이미지 그리드 */}
      <div className="flex-1 overflow-y-auto p-2">
        {recent.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground/40">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <span className="text-xs">생성된 이미지 없음</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-1.5">
            {recent.map((img) => (
              <div
                key={img.id}
                onClick={() => selectImage(img.id)}
                className={cn(
                  "group relative cursor-pointer overflow-hidden rounded-lg border transition-all duration-150",
                  selectedId === img.id
                    ? "border-primary/50 ring-1 ring-primary/30"
                    : "border-white/5 hover:border-white/15"
                )}
              >
                <img
                  src={`data:image/png;base64,${img.base64}`}
                  alt=""
                  className="aspect-square w-full object-cover"
                  draggable={false}
                />

                {/* 호버 오버레이 */}
                <div className="absolute inset-0 flex flex-col justify-between bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                  {/* 상단: 해상도 */}
                  <div className="text-[9px] text-white/70 font-mono">
                    {img.params.width}×{img.params.height}
                  </div>

                  {/* 하단: 액션 버튼 */}
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={(e) => handleCopy(e, img)}
                      title="클립보드 복사"
                      className="flex h-5 w-5 items-center justify-center rounded bg-white/10 hover:bg-white/25 text-white transition-colors"
                    >
                      <CopyIcon />
                    </button>
                    <button
                      onClick={(e) => handleDownload(e, img)}
                      title="다운로드"
                      className="flex h-5 w-5 items-center justify-center rounded bg-white/10 hover:bg-white/25 text-white transition-colors"
                    >
                      <DownloadIcon />
                    </button>
                    <button
                      onClick={(e) => handleRegenerate(e, img)}
                      title="동일 파라미터로 재생성"
                      className="flex h-5 w-5 items-center justify-center rounded bg-primary/30 hover:bg-primary/50 text-white transition-colors"
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <path d="M23 4v6h-6" /><path d="M1 20v-6h6" />
                        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
