import { useLibraryStore } from "@/stores/library-store";
import { cn } from "@/lib/cn";

function TrashIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

export default function ImageGrid() {
  const { images, selectedId, selectImage, deleteImage, clearAll } = useLibraryStore();

  if (images.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="opacity-30">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
        <p className="text-sm">생성된 이미지가 없습니다</p>
        <p className="text-xs opacity-60">메인 탭에서 이미지를 생성해보세요</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* 헤더 */}
      <div className="flex shrink-0 items-center justify-between border-b border-border px-3 py-2">
        <span className="text-xs text-muted-foreground">{images.length}장</span>
        <button
          type="button"
          onClick={() => {
            if (confirm("모든 이미지를 삭제하시겠습니까?")) clearAll();
          }}
          className="text-[10px] text-muted-foreground hover:text-destructive transition-colors"
        >
          전체 삭제
        </button>
      </div>

      {/* 그리드 */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {images.map((img) => (
            <div
              key={img.id}
              onClick={() => selectImage(img.id === selectedId ? null : img.id)}
              className={cn(
                "group relative aspect-square cursor-pointer overflow-hidden rounded-md border-2 transition-all",
                img.id === selectedId
                  ? "border-primary shadow-md"
                  : "border-transparent hover:border-border"
              )}
            >
              <img
                src={`data:image/png;base64,${img.base64}`}
                alt=""
                className="h-full w-full object-cover"
                draggable={false}
              />

              {/* 호버 오버레이 */}
              <div className="absolute inset-0 flex flex-col items-end justify-between bg-black/0 p-1 opacity-0 transition-all group-hover:bg-black/20 group-hover:opacity-100">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteImage(img.id);
                  }}
                  className="rounded bg-black/60 p-1 text-white hover:bg-destructive transition-colors"
                  title="삭제"
                >
                  <TrashIcon />
                </button>
                <span className="rounded bg-black/60 px-1 py-0.5 text-[10px] text-white">
                  {img.params.width}×{img.params.height}
                </span>
              </div>

              {/* 선택 표시 */}
              {img.id === selectedId && (
                <div className="absolute left-1 top-1 rounded-full bg-primary p-0.5">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
