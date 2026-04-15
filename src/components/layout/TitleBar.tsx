import { getCurrentWindow } from "@tauri-apps/api/window";
import { cn } from "@/lib/cn";
import { useLayoutStore } from "@/stores/layout-store";

function PanelLeftIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="9" y1="3" x2="9" y2="21" />
    </svg>
  );
}

function PanelRightIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="15" y1="3" x2="15" y2="21" />
    </svg>
  );
}

export default function TitleBar() {
  const appWindow = getCurrentWindow();
  const { leftPanelOpen, rightPanelOpen, toggleLeftPanel, toggleRightPanel } = useLayoutStore();

  return (
    <div className="relative flex h-10 w-full shrink-0 items-center bg-card/80 backdrop-blur-md border-b border-white/5 select-none">
      {/* 드래그 영역 */}
      <div data-tauri-drag-region className="absolute inset-0 z-0" />

      {/* 좌측: 왼쪽 패널 토글 */}
      <div className="relative z-10 flex items-center gap-0.5 pl-2">
        <button
          onClick={toggleLeftPanel}
          title="생성 패널 토글"
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-md transition-colors",
            leftPanelOpen
              ? "text-primary bg-primary/10 hover:bg-primary/20"
              : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
          )}
        >
          <PanelLeftIcon />
        </button>
      </div>

      {/* 중앙: 앱 타이틀 */}
      <span
        data-tauri-drag-region
        className="relative z-10 flex-1 text-center text-xs font-semibold tracking-widest text-foreground/40 uppercase pointer-events-none"
      >
        GENAI
      </span>

      {/* 우측: 오른쪽 패널 토글 + 윈도우 컨트롤 */}
      <div className="relative z-10 flex items-center gap-0.5 pr-1">
        <button
          onClick={toggleRightPanel}
          title="히스토리 패널 토글"
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-md transition-colors",
            rightPanelOpen
              ? "text-primary bg-primary/10 hover:bg-primary/20"
              : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
          )}
        >
          <PanelRightIcon />
        </button>

        {/* 구분선 */}
        <div className="mx-1 h-4 w-px bg-white/10" />

        {/* 최소화 */}
        <button
          onClick={() => appWindow.minimize()}
          title="최소화"
          className="flex h-8 w-9 items-center justify-center text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors"
        >
          <svg width="10" height="1" viewBox="0 0 10 1" fill="currentColor">
            <rect width="10" height="1" />
          </svg>
        </button>

        {/* 최대화 */}
        <button
          onClick={() => appWindow.toggleMaximize()}
          title="최대화"
          className="flex h-8 w-9 items-center justify-center text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors"
        >
          <svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="currentColor" strokeWidth="1">
            <rect x="0.5" y="0.5" width="8" height="8" />
          </svg>
        </button>

        {/* 닫기 */}
        <button
          onClick={() => appWindow.close()}
          title="닫기"
          className="flex h-8 w-9 items-center justify-center text-muted-foreground hover:bg-destructive hover:text-white transition-colors"
        >
          <svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="currentColor" strokeWidth="1.3">
            <line x1="0" y1="0" x2="9" y2="9" />
            <line x1="9" y1="0" x2="0" y2="9" />
          </svg>
        </button>
      </div>
    </div>
  );
}
