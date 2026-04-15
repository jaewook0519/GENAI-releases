import { useNavigate } from "react-router-dom";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import * as Switch from "@radix-ui/react-switch";
import { cn } from "@/lib/cn";
import { useSceneStore, type Scene } from "@/stores/scene-store";
import { TrashIcon } from "@/components/ui/icons";

function GripIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="9" cy="5" r="1" fill="currentColor" /><circle cx="15" cy="5" r="1" fill="currentColor" />
      <circle cx="9" cy="12" r="1" fill="currentColor" /><circle cx="15" cy="12" r="1" fill="currentColor" />
      <circle cx="9" cy="19" r="1" fill="currentColor" /><circle cx="15" cy="19" r="1" fill="currentColor" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

interface Props {
  scene: Scene;
  onPreview: (scene: Scene) => void;
}

export default function SceneCard({ scene, onPreview }: Props) {
  const navigate = useNavigate();
  const { updateScene, removeScene } = useSceneStore();

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: scene.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative flex flex-col rounded-lg border border-border bg-card transition-shadow",
        isDragging ? "shadow-lg opacity-80 z-50" : "hover:shadow-md",
        !scene.enabled && "opacity-60"
      )}
    >
      {/* 썸네일 */}
      <div className="relative h-32 overflow-hidden rounded-t-lg bg-secondary">
        {scene.lastResultBase64 ? (
          <img
            src={`data:image/png;base64,${scene.lastResultBase64}`}
            alt={scene.name}
            className="h-full w-full cursor-zoom-in object-cover"
            onClick={() => onPreview(scene)}
          />
        ) : (
          <div
            className="flex h-full cursor-pointer items-center justify-center"
            onClick={() => navigate(`/scenes/${scene.id}`)}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-muted-foreground/30">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
        )}

        {/* 드래그 핸들 */}
        <div
          {...attributes}
          {...listeners}
          className="absolute left-2 top-2 cursor-grab rounded bg-black/40 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <GripIcon />
        </div>

        {/* 파라미터 설정 버튼 */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); navigate(`/scenes/${scene.id}`); }}
          title="파라미터 설정"
          className="absolute right-2 top-2 rounded bg-black/40 p-1 opacity-0 group-hover:opacity-100 transition-opacity text-white/80 hover:text-white"
        >
          <SettingsIcon />
        </button>
      </div>

      {/* 정보 영역 */}
      <div className="flex flex-col gap-2 p-3">
        {/* 이름 */}
        <input
          value={scene.name}
          onChange={(e) => updateScene(scene.id, { name: e.target.value })}
          className="w-full bg-transparent text-sm font-medium text-foreground focus:outline-none"
          onClick={(e) => e.stopPropagation()}
        />

        {/* 프롬프트 직접 편집 */}
        <textarea
          value={scene.prompt}
          onChange={(e) => updateScene(scene.id, { prompt: e.target.value })}
          onClick={(e) => e.stopPropagation()}
          rows={3}
          placeholder="프롬프트 (비우면 전역 사용)"
          className="w-full resize-none rounded border border-border bg-secondary px-2 py-1.5 text-[10px] text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-ring leading-relaxed"
        />

        {/* 컨트롤 */}
        <div className="flex items-center justify-between">
          {/* 생성 매수 */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-muted-foreground">매수</span>
            <input
              type="number"
              value={scene.count}
              min={1}
              max={99}
              onChange={(e) => {
                const v = Math.max(1, Math.min(99, Number(e.target.value)));
                if (!isNaN(v)) updateScene(scene.id, { count: v });
              }}
              onClick={(e) => e.stopPropagation()}
              className="h-6 w-10 rounded border border-border bg-secondary text-center text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          {/* 활성화 토글 + 삭제 */}
          <div className="flex items-center gap-2">
            <Switch.Root
              checked={scene.enabled}
              onCheckedChange={(v) => updateScene(scene.id, { enabled: v })}
              onClick={(e) => e.stopPropagation()}
              className={cn(
                "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
                scene.enabled ? "bg-primary" : "bg-secondary"
              )}
            >
              <Switch.Thumb
                className={cn(
                  "pointer-events-none block h-4 w-4 rounded-full bg-white shadow transition-transform",
                  scene.enabled ? "translate-x-4" : "translate-x-0"
                )}
              />
            </Switch.Root>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeScene(scene.id);
              }}
              className="text-muted-foreground hover:text-destructive transition-colors"
            >
              <TrashIcon />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
