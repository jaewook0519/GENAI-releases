import { useParams, useNavigate } from "react-router-dom";
import * as Select from "@radix-ui/react-select";
import * as Slider from "@radix-ui/react-slider";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { useSceneStore } from "@/stores/scene-store";
import {
  RESOLUTION_PRESETS,
  MODEL_LABELS,
  SAMPLER_LABELS,
  NOISE_SCHEDULES,
  type GenerationSettings,
} from "@/stores/settings-store";
import type { NovelAIModel, Sampler } from "@/services/novelai-api";
import { CheckIcon, ChevronDownIcon } from "@/components/ui/icons";

function BackIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

const fieldClass = cn(
  "w-full rounded-md border border-border bg-secondary",
  "px-2.5 py-2 text-xs text-foreground placeholder:text-muted-foreground",
  "focus:outline-none focus:ring-1 focus:ring-ring resize-none"
);

interface SimpleSelectProps {
  value: string;
  onValueChange: (v: string) => void;
  items: { value: string; label: string }[];
}

function SimpleSelect({ value, onValueChange, items }: SimpleSelectProps) {
  const currentLabel = items.find((i) => i.value === value)?.label ?? value;
  return (
    <Select.Root value={value} onValueChange={onValueChange}>
      <Select.Trigger className="flex h-8 w-full items-center justify-between rounded-md border border-border bg-secondary px-2 text-xs text-foreground hover:bg-muted focus:outline-none focus:ring-1 focus:ring-ring">
        <Select.Value>{currentLabel}</Select.Value>
        <Select.Icon className="text-muted-foreground"><ChevronDownIcon /></Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className="z-50 min-w-[180px] overflow-hidden rounded-md border border-border bg-popover shadow-lg" position="popper" sideOffset={4}>
          <Select.Viewport className="p-1">
            {items.map((item) => (
              <Select.Item key={item.value} value={item.value} className="relative flex cursor-pointer select-none items-center rounded-sm px-6 py-1.5 text-xs text-foreground outline-none hover:bg-accent hover:text-accent-foreground data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground">
                <Select.ItemIndicator className="absolute left-1.5 flex items-center"><CheckIcon /></Select.ItemIndicator>
                <Select.ItemText>{item.label}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}

function SliderRow({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-24 shrink-0 text-xs text-muted-foreground">{label}</span>
      <Slider.Root value={[value]} onValueChange={([v]) => onChange(v)} min={min} max={max} step={step} className="relative flex flex-1 touch-none select-none items-center">
        <Slider.Track className="relative h-1 flex-1 rounded-full bg-secondary">
          <Slider.Range className="absolute h-full rounded-full bg-primary" />
        </Slider.Track>
        <Slider.Thumb className="block h-3.5 w-3.5 rounded-full border border-primary/50 bg-primary shadow focus:outline-none focus:ring-2 focus:ring-ring" />
      </Slider.Root>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => { const v = Number(e.target.value); if (!isNaN(v) && v >= min && v <= max) onChange(v); }}
        className="h-7 w-12 rounded border border-border bg-secondary px-1 text-center text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
      />
    </div>
  );
}

export default function SceneDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { scenes, updateScene } = useSceneStore();
  const scene = scenes.find((s) => s.id === id);

  if (!scene) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">씬을 찾을 수 없습니다.</p>
      </div>
    );
  }

  const p = scene.params as Partial<GenerationSettings>;

  const update = (patch: Partial<GenerationSettings>) =>
    updateScene(scene.id, { params: { ...p, ...patch } });

  const resolutionLabel =
    RESOLUTION_PRESETS.find((r) => r.width === p.width && r.height === p.height)?.label ??
    (p.width && p.height ? `${p.width}×${p.height}` : "전역 기본값");

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* 헤더 */}
      <div className="flex shrink-0 items-center gap-3 border-b border-border bg-card px-4 py-2">
        <Button variant="ghost" size="sm" onClick={() => navigate("/scenes")} className="gap-1.5">
          <BackIcon />
          씬 목록
        </Button>
        <div className="h-4 w-px bg-border" />
        <input
          value={scene.name}
          onChange={(e) => updateScene(scene.id, { name: e.target.value })}
          className="bg-transparent text-sm font-medium text-foreground focus:outline-none"
        />
      </div>

      {/* 콘텐츠 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 좌: 프롬프트 */}
        <div className="flex w-72 shrink-0 flex-col gap-4 border-r border-border overflow-y-auto p-4">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">프롬프트</label>
            <textarea
              value={scene.prompt}
              onChange={(e) => updateScene(scene.id, { prompt: e.target.value })}
              rows={6}
              className={fieldClass}
              placeholder="씬 전용 프롬프트 (비우면 전역 기본값 사용)"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">네거티브 프롬프트</label>
            <textarea
              value={scene.negativePrompt}
              onChange={(e) => updateScene(scene.id, { negativePrompt: e.target.value })}
              rows={3}
              className={fieldClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">생성 매수</label>
            <input
              type="number"
              value={scene.count}
              min={1}
              max={99}
              onChange={(e) => {
                const v = Math.max(1, Math.min(99, Number(e.target.value)));
                if (!isNaN(v)) updateScene(scene.id, { count: v });
              }}
              className={cn(fieldClass, "h-8")}
            />
          </div>
        </div>

        {/* 우: 파라미터 (Partial — 빈 값은 전역 기본값 사용) */}
        <div className="flex-1 overflow-y-auto p-4">
          <p className="mb-4 text-xs text-muted-foreground">
            씬별 파라미터를 덮어씁니다. 비어 있으면 Main Mode의 전역 설정을 사용합니다.
          </p>

          <div className="flex flex-col gap-4">
            {/* 모델 */}
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">모델</label>
              <SimpleSelect
                value={p.model ?? ""}
                onValueChange={(v) => update({ model: v as NovelAIModel })}
                items={[
                  { value: "", label: "전역 기본값" },
                  ...Object.entries(MODEL_LABELS).map(([value, label]) => ({ value, label })),
                ]}
              />
            </div>

            {/* 해상도 */}
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">해상도</label>
              <SimpleSelect
                value={resolutionLabel}
                onValueChange={(v) => {
                  if (v === "전역 기본값") {
                    update({ width: undefined, height: undefined });
                    return;
                  }
                  const preset = RESOLUTION_PRESETS.find((r) => r.label === v);
                  if (preset) update({ width: preset.width, height: preset.height });
                }}
                items={[
                  { value: "전역 기본값", label: "전역 기본값" },
                  ...RESOLUTION_PRESETS.map((r) => ({ value: r.label, label: r.label })),
                ]}
              />
            </div>

            {/* 스텝 */}
            <SliderRow
              label="스텝"
              value={p.steps ?? 28}
              min={1}
              max={50}
              step={1}
              onChange={(v) => update({ steps: v })}
            />

            {/* CFG */}
            <SliderRow
              label="CFG 스케일"
              value={p.cfgScale ?? 5}
              min={0}
              max={10}
              step={0.1}
              onChange={(v) => update({ cfgScale: Math.round(v * 10) / 10 })}
            />

            {/* 샘플러 */}
            <div className="flex items-center gap-2">
              <span className="w-24 shrink-0 text-xs text-muted-foreground">샘플러</span>
              <SimpleSelect
                value={p.sampler ?? ""}
                onValueChange={(v) => update({ sampler: v as Sampler })}
                items={[
                  { value: "", label: "전역 기본값" },
                  ...Object.entries(SAMPLER_LABELS).map(([value, label]) => ({ value, label })),
                ]}
              />
            </div>

            {/* 노이즈 스케줄 */}
            <div className="flex items-center gap-2">
              <span className="w-24 shrink-0 text-xs text-muted-foreground">노이즈 스케줄</span>
              <SimpleSelect
                value={p.noiseSchedule ?? ""}
                onValueChange={(v) => update({ noiseSchedule: v })}
                items={[
                  { value: "", label: "전역 기본값" },
                  ...NOISE_SCHEDULES.map((v) => ({ value: v, label: v })),
                ]}
              />
            </div>

            {/* 시드 */}
            <div className="flex items-center gap-2">
              <span className="w-24 shrink-0 text-xs text-muted-foreground">시드</span>
              <input
                type="number"
                value={p.seed ?? ""}
                placeholder="랜덤"
                min={0}
                max={4294967295}
                onChange={(e) => {
                  const v = e.target.value === "" ? undefined : Number(e.target.value);
                  update({ seed: v as number | undefined });
                }}
                className="h-8 flex-1 rounded-md border border-border bg-secondary px-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
