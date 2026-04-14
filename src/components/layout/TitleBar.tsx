import { getCurrentWindow } from "@tauri-apps/api/window";

export default function TitleBar() {
  const appWindow = getCurrentWindow();

  return (
    <div
      data-tauri-drag-region
      className="flex h-9 w-full items-center justify-between bg-card px-3 select-none"
    >
      {/* 앱 타이틀 */}
      <span
        data-tauri-drag-region
        className="text-sm font-semibold text-foreground/70"
      >
        GENAI
      </span>

      {/* 윈도우 컨트롤 버튼 */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => appWindow.minimize()}
          className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          title="최소화"
        >
          <svg width="10" height="1" viewBox="0 0 10 1" fill="currentColor">
            <rect width="10" height="1" />
          </svg>
        </button>
        <button
          onClick={() => appWindow.toggleMaximize()}
          className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          title="최대화"
        >
          <svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="currentColor" strokeWidth="1">
            <rect x="0.5" y="0.5" width="8" height="8" />
          </svg>
        </button>
        <button
          onClick={() => appWindow.close()}
          className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
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
