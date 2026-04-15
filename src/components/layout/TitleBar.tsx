import { getCurrentWindow } from "@tauri-apps/api/window";

export default function TitleBar() {
  const appWindow = getCurrentWindow();

  return (
    <div className="relative flex h-9 w-full shrink-0 items-center bg-card select-none">
      {/* 드래그 영역 — 버튼 영역 제외한 중간 공간을 절대 위치로 채움 */}
      <div
        data-tauri-drag-region
        className="absolute inset-0 z-0"
      />

      {/* 앱 타이틀 (드래그 가능, 포인터 이벤트 없음) */}
      <span
        data-tauri-drag-region
        className="relative z-10 pl-3 text-sm font-semibold text-foreground/70 pointer-events-none"
      >
        GENAI
      </span>

      {/* 스페이서 */}
      <div data-tauri-drag-region className="relative z-10 flex-1" />

      {/* 윈도우 컨트롤 버튼 — z-10으로 드래그 영역 위에 배치 */}
      <div className="relative z-10 flex items-center gap-0.5 pr-1">
        <button
          onClick={() => appWindow.minimize()}
          className="flex h-9 w-11 items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          title="최소화"
        >
          <svg width="10" height="1" viewBox="0 0 10 1" fill="currentColor">
            <rect width="10" height="1" />
          </svg>
        </button>
        <button
          onClick={() => appWindow.toggleMaximize()}
          className="flex h-9 w-11 items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          title="최대화"
        >
          <svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="currentColor" strokeWidth="1">
            <rect x="0.5" y="0.5" width="8" height="8" />
          </svg>
        </button>
        <button
          onClick={() => appWindow.close()}
          className="flex h-9 w-11 items-center justify-center text-muted-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
          title="닫기"
        >
          <svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="currentColor" strokeWidth="1.2">
            <line x1="0" y1="0" x2="9" y2="9" />
            <line x1="9" y1="0" x2="0" y2="9" />
          </svg>
        </button>
      </div>
    </div>
  );
}
