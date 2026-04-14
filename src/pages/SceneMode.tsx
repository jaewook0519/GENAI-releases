import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { useSceneStore } from "@/stores/scene-store";
import SceneCard from "@/components/scene/SceneCard";
import PresetManager from "@/components/scene/PresetManager";

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <rect x="3" y="3" width="18" height="18" rx="2" />
    </svg>
  );
}

export default function SceneMode() {
  const { t } = useTranslation();
  const { scenes, batchProgress, isRunning, addScene, reorderScenes, startBatch, stopBatch } =
    useSceneStore();

  const enabledCount = scenes.filter((s) => s.enabled).length;
  const totalImages = scenes.filter((s) => s.enabled).reduce((sum, s) => sum + s.count, 0);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIdx = scenes.findIndex((s) => s.id === active.id);
      const newIdx = scenes.findIndex((s) => s.id === over.id);
      if (oldIdx !== -1 && newIdx !== -1) {
        reorderScenes(oldIdx, newIdx);
      }
    }
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* 툴바 */}
      <div className="flex shrink-0 items-center justify-between border-b border-border bg-card px-4 py-2">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={addScene} className="gap-1.5">
            <PlusIcon />
            {t("scene.addScene")}
          </Button>
          <PresetManager />

          {isRunning ? (
            <Button variant="destructive" size="sm" onClick={stopBatch} className="gap-1.5">
              <StopIcon />
              {t("scene.stopBatch")}
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={startBatch}
              disabled={enabledCount === 0}
              className="gap-1.5"
            >
              <PlayIcon />
              {t("scene.runBatch")}
            </Button>
          )}
        </div>

        {/* 진행률 */}
        <div className="flex items-center gap-3">
          {isRunning && batchProgress.total > 0 ? (
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-32 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{
                    width: `${(batchProgress.done / batchProgress.total) * 100}%`,
                  }}
                />
              </div>
              <span className="text-xs text-muted-foreground">
                {t("scene.progress", {
                  done: batchProgress.done,
                  total: batchProgress.total,
                })}
              </span>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">
              {enabledCount > 0
                ? `${enabledCount}개 씬 · ${totalImages}장`
                : "활성화된 씬 없음"}
            </span>
          )}
        </div>
      </div>

      {/* 씬 그리드 */}
      <div className="flex-1 overflow-y-auto p-4">
        {scenes.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-muted-foreground/30">
              <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
            <p className="text-sm text-muted-foreground">씬을 추가하여 배치 생성을 시작하세요.</p>
            <Button variant="outline" onClick={addScene} className="gap-1.5">
              <PlusIcon />
              {t("scene.addScene")}
            </Button>
          </div>
        ) : (
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext
              items={scenes.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div
                className={cn(
                  "grid gap-3",
                  "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
                )}
              >
                {scenes.map((scene) => (
                  <SceneCard key={scene.id} scene={scene} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}
