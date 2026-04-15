import { type ReactNode, useRef, useCallback, useState } from "react";
import * as Select from "@radix-ui/react-select";
import * as Slider from "@radix-ui/react-slider";
import * as Switch from "@radix-ui/react-switch";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/cn";
import { useSettingsStore, RESOLUTION_PRESETS, MODEL_LABELS, SAMPLER_LABELS, NOISE_SCHEDULES } from "@/stores/settings-store";
import { useGenerationStore } from "@/stores/generation-store";
import FragmentPicker from "@/components/prompt/FragmentPicker";
import { ChevronDownIcon, CheckIcon, SpinnerIcon } from "@/components/ui/icons";
import type { NovelAIModel, Sampler } from "@/services/novelai-api";

// ─── 아이콘 ───────────────────────────────────────────────────────────────────

function DiceIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <rect x="2" y="2" width="20" height="20" rx="3" />
      <circle cx="8" cy="8" r="1.2" fill="currentColor" />
      <circle cx="16" cy="16" r="1.2" fill="currentColor" />
      <circle cx="16" cy="8" r="1.2" fill="currentColor" />
      <circle cx="8" cy="16" r="1.2" fill="currentColor" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" />
    </svg>
  );
}

function ChevronUpDownIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

// ─── 공통 서브컴포넌트 ────────────────────────────────────────────────────────

function SectionHeader({
  label,
  children,
  collapsible = false,
  open = true,
  onToggle,
}: {
  label: string;
  children?: ReactNode;
  collapsible?: boolean;
  open?: boolean;
  onToggle?: () => void;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between px-3 py-2",
        collapsible && "cursor-pointer select-none"
      )}
      onClick={collapsible ? onToggle : undefined}
    >
      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
        {label}
      </span>
      <div className="flex items-center gap-1">
        {children}
        {collapsible && (
          <span className={cn("text-muted-foreground/40 transition-transform duration-200", open ? "rotate-0" : "-rotate-90")}>
            <ChevronDownIcon />
          </span>
        )}
      </div>
    </div>
  );
}

function Divider() {
  return <div className="mx-3 h-px bg-white/5" />;
}

// ─── Radix Select ─────────────────────────────────────────────────────────────

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
          "flex h-8 w-full items-center justify-between rounded-lg border border-border",
          "bg-secondary px-2.5 text-xs text-foreground",
          "hover:bg-muted focus:outline-none focus:ring-1 focus:ring-ring",
          "transition-colors",
          className
        )}
      >
        <Select.Value>{currentLabel}</Select.Value>
        <Select.Icon className="text-muted-foreground/50 ml-1">
          <ChevronUpDownIcon />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content
          className="z-50 min-w-[200px] overflow-hidden rounded-xl border border-border bg-popover shadow-xl"
          position="popper"
          sideOffset={4}
        >
          <Select.Viewport className="p-1">
            {items.map((item) => (
              <Select.Item
                key={item.value}
                value={item.value}
                className={cn(
                  "relative flex cursor-pointer select-none items-center rounded-lg px-7 py-1.5 text-xs",
                  "text-foreground outline-none",
                  "hover:bg-accent data-[highlighted]:bg-accent"
                )}
              >
                <Select.ItemIndicator className="absolute left-2 flex items-center">
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

// ─── 슬라이더 ─────────────────────────────────────────────────────────────────

function SliderRow({ label, value, min, max, step, onChange }: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-2 px-3 py-1">
      <span className="w-20 shrink-0 text-[11px] text-muted-foreground">{label}</span>
      <Slider.Root
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={min} max={max} step={step}
        className="relative flex flex-1 touch-none select-none items-center"
      >
        <Slider.Track className="relative h-1 flex-1 rounded-full bg-white/8">
          <Slider.Range className="absolute h-full rounded-full bg-primary/70" />
        </Slider.Track>
        <Slider.Thumb className="block h-3 w-3 rounded-full border border-primary/60 bg-primary shadow focus:outline-none" />
      </Slider.Root>
      <input
        type="number" value={value} min={min} max={max} step={step}
        onChange={(e) => { const v = Number(e.target.value); if (!isNaN(v) && v >= min && v <= max) onChange(v); }}
        className="h-7 w-11 rounded-lg border border-border bg-secondary px-1 text-center text-[11px] text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
      />
    </div>
  );
}

// ─── 스위치 ───────────────────────────────────────────────────────────────────

function SwitchRow({ label, checked, onCheckedChange, disabled }: {
  label: string; checked: boolean; onCheckedChange: (v: boolean) => void; disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-3 py-1">
      <span className={cn("text-[11px]", disabled ? "text-muted-foreground/40" : "text-foreground/80")}>
        {label}
      </span>
      <Switch.Root
        checked={checked} onCheckedChange={onCheckedChange} disabled={disabled}
        className={cn(
          "relative inline-flex h-4.5 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
          "focus:outline-none disabled:cursor-not-allowed disabled:opacity-40",
          checked ? "bg-primary" : "bg-white/10"
        )}
      >
        <Switch.Thumb className={cn(
          "pointer-events-none block h-3.5 w-3.5 rounded-full bg-white shadow-md transition-transform",
          checked ? "translate-x-3.5" : "translate-x-0"
        )} />
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
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const handleFragmentInsert = useCallback((text: string) => {
    const el = promptRef.current;
    if (!el) { settings.update({ prompt: settings.prompt + text }); return; }
    const start = el.selectionStart ?? settings.prompt.length;
    const end = el.selectionEnd ?? settings.prompt.length;
    settings.update({ prompt: settings.prompt.slice(0, start) + text + settings.prompt.slice(end) });
    requestAnimationFrame(() => {
      el.selectionStart = start + text.length;
      el.selectionEnd = start + text.length;
      el.focus();
    });
  }, [settings]);

  const resolutionLabel =
    RESOLUTION_PRESETS.find((r) => r.width === settings.width && r.height === settings.height)
      ?.label ?? `${settings.width}×${settings.height}`;

  const handleGenerate = () => generate({
    model: settings.model, prompt: settings.prompt, negativePrompt: settings.negativePrompt,
    width: settings.width, height: settings.height, steps: settings.steps,
    cfgScale: settings.cfgScale, sampler: settings.sampler, seed: settings.seed,
    noiseSchedule: settings.noiseSchedule, qualityToggle: settings.qualityToggle,
    smea: settings.smea, smeaDyn: settings.smeaDyn,
  });

  const textareaClass = cn(
    "w-full resize-none rounded-lg border border-border bg-secondary",
    "px-2.5 py-2 text-xs text-foreground placeholder:text-muted-foreground/40",
    "focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
  );

  return (
    <div className="flex h-full flex-col gap-0 overflow-y-auto">

      {/* ── 프롬프트 섹션 ──────────────────────────────── */}
      <div className="px-3 pt-3 pb-2">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
            {t("generation.prompt")}
          </span>
          <div className="flex items-center gap-1">
            <span className="text-[9px] text-muted-foreground/40">{settings.prompt.length}</span>
            <FragmentPicker onInsert={handleFragmentInsert} />
          </div>
        </div>
        <textarea
          ref={promptRef}
          value={settings.prompt}
          onChange={(e) => settings.update({ prompt: e.target.value })}
          rows={6}
          className={textareaClass}
        />
      </div>

      {/* ── 네거티브 프롬프트 ──────────────────────────── */}
      <div className="px-3 pb-2">
        <div className="mb-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
            {t("generation.negativePrompt")}
          </span>
        </div>
        <textarea
          value={settings.negativePrompt}
          onChange={(e) => settings.update({ negativePrompt: e.target.value })}
          rows={3}
          className={textareaClass}
        />
      </div>

      {/* ── 생성 버튼 ──────────────────────────────────── */}
      <div className="px-3 pb-3">
        {isGenerating ? (
          <button
            onClick={cancel}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-medium text-muted-foreground hover:bg-white/8 transition-colors"
          >
            <SpinnerIcon />
            {t("generation.generating")} — {t("generation.cancel")}
          </button>
        ) : (
          <button
            onClick={handleGenerate}
            className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-[0.98] transition-all"
          >
            {t("generation.generate")}
          </button>
        )}
      </div>

      <Divider />

      {/* ── 기본 설정 ──────────────────────────────────── */}
      <SectionHeader label={t("generation.model")} />
      <div className="px-3 pb-2">
        <SimpleSelect
          value={settings.model}
          onValueChange={(v) => settings.update({ model: v as NovelAIModel })}
          items={Object.entries(MODEL_LABELS).map(([value, label]) => ({ value, label }))}
        />
      </div>

      <div className="px-3 pb-3">
        <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
          {t("generation.resolution")}
        </div>
        <SimpleSelect
          value={resolutionLabel}
          onValueChange={(v) => {
            const preset = RESOLUTION_PRESETS.find((r) => r.label === v);
            if (preset) settings.update({ width: preset.width, height: preset.height });
          }}
          items={RESOLUTION_PRESETS.map((r) => ({ value: r.label, label: r.label }))}
        />
      </div>

      <Divider />

      {/* ── 시드 ───────────────────────────────────────── */}
      <SectionHeader label={t("generation.seed")} />
      <div className="px-3 pb-2">
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            value={settings.seed ?? ""}
            placeholder={t("generation.randomSeed")}
            min={0} max={4294967295}
            onChange={(e) => settings.update({ seed: e.target.value === "" ? null : Number(e.target.value) })}
            className="h-8 flex-1 rounded-lg border border-border bg-secondary px-2.5 text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <button
            onClick={() => settings.update({ seed: null })}
            title={t("generation.randomSeed")}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-secondary text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <DiceIcon />
          </button>
        </div>
        {lastUsedSeed !== null && (
          <button
            type="button"
            onClick={() => settings.update({ seed: lastUsedSeed })}
            className="mt-1.5 text-left text-[10px] text-muted-foreground/40 hover:text-muted-foreground transition-colors"
          >
            {t("generation.lastSeed")}: {lastUsedSeed}
          </button>
        )}
      </div>

      <Divider />

      {/* ── 고급 설정 (접힘/펼침) ──────────────────────── */}
      <SectionHeader
        label="고급 설정"
        collapsible
        open={advancedOpen}
        onToggle={() => setAdvancedOpen((v) => !v)}
      />

      {advancedOpen && (
        <>
          <SliderRow label={t("generation.steps")} value={settings.steps} min={1} max={50} step={1}
            onChange={(v) => settings.update({ steps: v })} />
          <SliderRow label={t("generation.cfg")} value={settings.cfgScale} min={0} max={10} step={0.1}
            onChange={(v) => settings.update({ cfgScale: Math.round(v * 10) / 10 })} />

          <div className="px-3 py-1">
            <div className="flex items-center gap-2">
              <span className="w-20 shrink-0 text-[11px] text-muted-foreground">{t("generation.sampler")}</span>
              <SimpleSelect
                value={settings.sampler}
                onValueChange={(v) => settings.update({ sampler: v as Sampler })}
                items={Object.entries(SAMPLER_LABELS).map(([value, label]) => ({ value, label }))}
              />
            </div>
          </div>

          <div className="px-3 py-1 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-20 shrink-0 text-[11px] text-muted-foreground">{t("generation.noiseSchedule")}</span>
              <SimpleSelect
                value={settings.noiseSchedule}
                onValueChange={(v) => settings.update({ noiseSchedule: v })}
                items={NOISE_SCHEDULES.map((v) => ({ value: v, label: v }))}
              />
            </div>
          </div>

          <Divider />

          <div className="py-1">
            <SwitchRow label={t("generation.qualityToggle")} checked={settings.qualityToggle}
              onCheckedChange={(v) => settings.update({ qualityToggle: v })} />
            <SwitchRow label="SMEA" checked={settings.smea}
              onCheckedChange={(v) => settings.update({ smea: v, smeaDyn: v ? settings.smeaDyn : false })} />
            <SwitchRow label="SMEA DYN" checked={settings.smeaDyn}
              onCheckedChange={(v) => settings.update({ smeaDyn: v })} disabled={!settings.smea} />
          </div>
        </>
      )}

      {/* 하단 여백 */}
      <div className="h-4" />
    </div>
  );
}
