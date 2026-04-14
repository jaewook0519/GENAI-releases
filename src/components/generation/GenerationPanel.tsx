import { type ReactNode, useRef, useCallback } from "react";
import * as Select from "@radix-ui/react-select";
import * as Slider from "@radix-ui/react-slider";
import * as Switch from "@radix-ui/react-switch";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { useSettingsStore, RESOLUTION_PRESETS, MODEL_LABELS, SAMPLER_LABELS, NOISE_SCHEDULES } from "@/stores/settings-store";
import { useGenerationStore } from "@/stores/generation-store";
import FragmentPicker from "@/components/prompt/FragmentPicker";
import type { NovelAIModel, Sampler } from "@/services/novelai-api";

// ─── 아이콘 ───────────────────────────────────────────────────────────────────

function ChevronDownIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function DiceIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="3" />
      <circle cx="8" cy="8" r="1.2" fill="currentColor" />
      <circle cx="16" cy="16" r="1.2" fill="currentColor" />
      <circle cx="16" cy="8" r="1.2" fill="currentColor" />
      <circle cx="8" cy="16" r="1.2" fill="currentColor" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M21 12a9 9 0 11-6.219-8.56" />
    </svg>
  );
}

// ─── 공통 서브 컴포넌트 ───────────────────────────────────────────────────────

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
      {children}
    </span>
  );
}

function FieldRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-24 shrink-0 text-xs text-muted-foreground">{label}</span>
      <div className="flex-1">{children}</div>
    </div>
  );
}

// ─── Radix Select 래퍼 ────────────────────────────────────────────────────────

interface SimpleSelectProps {
  value: string;
  onValueChange: (v: string) => void;
  items: { value: string; label: string }[];
  className?: string;
}

function SimpleSelect({ value, onValueChange, items, className }: SimpleSelectProps) {
  const currentLabel = items.find((i) => i.value === value)?.label ?? value;
  return (
    <Select.Root value={value} onValueChange={onValueChange}>
      <Select.Trigger
        className={cn(
          "flex h-8 w-full items-center justify-between rounded-md border border-border",
          "bg-secondary px-2 text-xs text-foreground",
          "hover:bg-muted focus:outline-none focus:ring-1 focus:ring-ring",
          "data-[placeholder]:text-muted-foreground",
          className
        )}
      >
        <Select.Value>{currentLabel}</Select.Value>
        <Select.Icon className="text-muted-foreground">
          <ChevronDownIcon />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content
          className="z-50 min-w-[180px] overflow-hidden rounded-md border border-border bg-popover shadow-lg"
          position="popper"
          sideOffset={4}
        >
          <Select.Viewport className="p-1">
            {items.map((item) => (
              <Select.Item
                key={item.value}
                value={item.value}
                className={cn(
                  "relative flex cursor-pointer select-none items-center rounded-sm px-6 py-1.5 text-xs",
                  "text-foreground outline-none",
                  "hover:bg-accent hover:text-accent-foreground",
                  "data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground"
                )}
              >
                <Select.ItemIndicator className="absolute left-1.5 flex items-center justify-center">
                  <CheckIcon />
                </Select.ItemIndicator>
                <Select.ItemText>{item.label}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}

// ─── 슬라이더 + 숫자 입력 ────────────────────────────────────────────────────

interface SliderFieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}

function SliderField({ label, value, min, max, step, onChange }: SliderFieldProps) {
  return (
    <FieldRow label={label}>
      <div className="flex items-center gap-2">
        <Slider.Root
          value={[value]}
          onValueChange={([v]) => onChange(v)}
          min={min}
          max={max}
          step={step}
          className="relative flex flex-1 touch-none select-none items-center"
        >
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
          onChange={(e) => {
            const v = Number(e.target.value);
            if (!isNaN(v) && v >= min && v <= max) onChange(v);
          }}
          className="h-7 w-12 rounded border border-border bg-secondary px-1 text-center text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>
    </FieldRow>
  );
}

// ─── 토글 스위치 ─────────────────────────────────────────────────────────────

function SwitchField({
  label,
  checked,
  onCheckedChange,
  disabled,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={cn("text-xs", disabled ? "text-muted-foreground/50" : "text-foreground")}>
        {label}
      </span>
      <Switch.Root
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent",
          "transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 focus:ring-offset-background",
          "disabled:cursor-not-allowed disabled:opacity-50",
          checked ? "bg-primary" : "bg-secondary"
        )}
      >
        <Switch.Thumb
          className={cn(
            "pointer-events-none block h-4 w-4 rounded-full bg-white shadow-md ring-0 transition-transform",
            checked ? "translate-x-4" : "translate-x-0"
          )}
        />
      </Switch.Root>
    </div>
  );
}

// ─── 메인 패널 ────────────────────────────────────────────────────────────────

export default function GenerationPanel() {
  const { t } = useTranslation();
  const settings = useSettingsStore();
  const { isGenerating, lastUsedSeed, generate, cancel } = useGenerationStore();
  const promptRef = useRef<HTMLTextAreaElement>(null);

  const handleFragmentInsert = useCallback((text: string) => {
    const el = promptRef.current;
    if (!el) {
      settings.update({ prompt: settings.prompt + text });
      return;
    }
    const start = el.selectionStart ?? settings.prompt.length;
    const end = el.selectionEnd ?? settings.prompt.length;
    const newPrompt = settings.prompt.slice(0, start) + text + settings.prompt.slice(end);
    settings.update({ prompt: newPrompt });
    // 커서 위치 복원
    requestAnimationFrame(() => {
      el.selectionStart = start + text.length;
      el.selectionEnd = start + text.length;
      el.focus();
    });
  }, [settings]);

  const resolutionLabel =
    RESOLUTION_PRESETS.find((r) => r.width === settings.width && r.height === settings.height)
      ?.label ?? `${settings.width}×${settings.height}`;

  const handleGenerate = () => {
    generate({
      model: settings.model,
      prompt: settings.prompt,
      negativePrompt: settings.negativePrompt,
      width: settings.width,
      height: settings.height,
      steps: settings.steps,
      cfgScale: settings.cfgScale,
      sampler: settings.sampler,
      seed: settings.seed,
      noiseSchedule: settings.noiseSchedule,
      qualityToggle: settings.qualityToggle,
      smea: settings.smea,
      smeaDyn: settings.smeaDyn,
    });
  };

  return (
    <div className="flex h-full flex-col gap-3 overflow-y-auto p-3">
      {/* 프롬프트 */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <SectionLabel>{t("generation.prompt")}</SectionLabel>
          <FragmentPicker onInsert={handleFragmentInsert} />
        </div>
        <textarea
          ref={promptRef}
          value={settings.prompt}
          onChange={(e) => settings.update({ prompt: e.target.value })}
          placeholder="1girl, masterpiece, best quality..."
          rows={5}
          className={cn(
            "w-full resize-none rounded-md border border-border bg-secondary",
            "px-2.5 py-2 text-xs text-foreground placeholder:text-muted-foreground",
            "focus:outline-none focus:ring-1 focus:ring-ring"
          )}
        />
        <div className="text-right text-[10px] text-muted-foreground">
          {settings.prompt.length} chars
        </div>
      </div>

      {/* 네거티브 프롬프트 */}
      <div className="flex flex-col gap-1.5">
        <SectionLabel>{t("generation.negativePrompt")}</SectionLabel>
        <textarea
          value={settings.negativePrompt}
          onChange={(e) => settings.update({ negativePrompt: e.target.value })}
          rows={3}
          className={cn(
            "w-full resize-none rounded-md border border-border bg-secondary",
            "px-2.5 py-2 text-xs text-foreground placeholder:text-muted-foreground",
            "focus:outline-none focus:ring-1 focus:ring-ring"
          )}
        />
      </div>

      {/* 생성 버튼 */}
      {isGenerating ? (
        <Button
          variant="outline"
          size="lg"
          className="w-full gap-2"
          onClick={cancel}
        >
          <SpinnerIcon />
          {t("generation.generating")} — {t("generation.cancel")}
        </Button>
      ) : (
        <Button size="lg" className="w-full" onClick={handleGenerate}>
          {t("generation.generate")}
        </Button>
      )}

      <div className="h-px bg-border" />

      {/* 모델 */}
      <div className="flex flex-col gap-1.5">
        <SectionLabel>{t("generation.model")}</SectionLabel>
        <SimpleSelect
          value={settings.model}
          onValueChange={(v) => settings.update({ model: v as NovelAIModel })}
          items={Object.entries(MODEL_LABELS).map(([value, label]) => ({ value, label }))}
        />
      </div>

      {/* 해상도 */}
      <div className="flex flex-col gap-1.5">
        <SectionLabel>{t("generation.resolution")}</SectionLabel>
        <SimpleSelect
          value={resolutionLabel}
          onValueChange={(v) => {
            const preset = RESOLUTION_PRESETS.find((r) => r.label === v);
            if (preset) settings.update({ width: preset.width, height: preset.height });
          }}
          items={RESOLUTION_PRESETS.map((r) => ({ value: r.label, label: r.label }))}
        />
      </div>

      <div className="h-px bg-border" />

      {/* 스텝 */}
      <SliderField
        label={t("generation.steps")}
        value={settings.steps}
        min={1}
        max={50}
        step={1}
        onChange={(v) => settings.update({ steps: v })}
      />

      {/* CFG */}
      <SliderField
        label={t("generation.cfg")}
        value={settings.cfgScale}
        min={0}
        max={10}
        step={0.1}
        onChange={(v) => settings.update({ cfgScale: Math.round(v * 10) / 10 })}
      />

      {/* 샘플러 */}
      <FieldRow label={t("generation.sampler")}>
        <SimpleSelect
          value={settings.sampler}
          onValueChange={(v) => settings.update({ sampler: v as Sampler })}
          items={Object.entries(SAMPLER_LABELS).map(([value, label]) => ({ value, label }))}
        />
      </FieldRow>

      {/* 노이즈 스케줄 */}
      <FieldRow label={t("generation.noiseSchedule")}>
        <SimpleSelect
          value={settings.noiseSchedule}
          onValueChange={(v) => settings.update({ noiseSchedule: v })}
          items={NOISE_SCHEDULES.map((v) => ({ value: v, label: v }))}
        />
      </FieldRow>

      <div className="h-px bg-border" />

      {/* 시드 */}
      <div className="flex flex-col gap-1.5">
        <SectionLabel>{t("generation.seed")}</SectionLabel>
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            value={settings.seed ?? ""}
            placeholder={t("generation.randomSeed")}
            min={0}
            max={4294967295}
            onChange={(e) => {
              const v = e.target.value === "" ? null : Number(e.target.value);
              settings.update({ seed: v });
            }}
            className={cn(
              "h-8 flex-1 rounded-md border border-border bg-secondary",
              "px-2 text-xs text-foreground placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-1 focus:ring-ring"
            )}
          />
          <Button
            variant="outline"
            size="icon"
            title={t("generation.randomSeed")}
            onClick={() => settings.update({ seed: null })}
          >
            <DiceIcon />
          </Button>
        </div>
        {lastUsedSeed !== null && (
          <button
            type="button"
            className="text-left text-[10px] text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => settings.update({ seed: lastUsedSeed })}
            title="클릭하여 이 시드 고정"
          >
            {t("generation.lastSeed")}: {lastUsedSeed}
          </button>
        )}
      </div>

      <div className="h-px bg-border" />

      {/* 토글 옵션 */}
      <div className="flex flex-col gap-2">
        <SwitchField
          label={t("generation.qualityToggle")}
          checked={settings.qualityToggle}
          onCheckedChange={(v) => settings.update({ qualityToggle: v })}
        />
        <SwitchField
          label="SMEA"
          checked={settings.smea}
          onCheckedChange={(v) => settings.update({ smea: v, smeaDyn: v ? settings.smeaDyn : false })}
        />
        <SwitchField
          label="SMEA DYN"
          checked={settings.smeaDyn}
          onCheckedChange={(v) => settings.update({ smeaDyn: v })}
          disabled={!settings.smea}
        />
      </div>

      {/* 하단 여백 */}
      <div className="h-2" />
    </div>
  );
}
