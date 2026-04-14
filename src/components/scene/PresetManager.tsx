import { useState } from "react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { usePresetStore } from "@/stores/preset-store";
import { useSettingsStore } from "@/stores/settings-store";

function SaveIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

export default function PresetManager() {
  const { presets, addPreset, removePreset, applyPreset } = usePresetStore();
  const settings = useSettingsStore();
  const [open, setOpen] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [showSaveForm, setShowSaveForm] = useState(false);

  const handleSave = () => {
    const name = saveName.trim() || `프리셋 ${presets.length + 1}`;
    addPreset(name, {
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
    setSaveName("");
    setShowSaveForm(false);
  };

  const handleExport = (id: string) => {
    const preset = presets.find((p) => p.id === id);
    if (!preset) return;
    const blob = new Blob([JSON.stringify(preset, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${preset.name}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          if (data.params && data.name) {
            addPreset(data.name, data.params);
          }
        } catch {
          alert("올바른 프리셋 파일이 아닙니다.");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs transition-colors",
          "text-muted-foreground hover:bg-secondary hover:text-foreground",
          open && "bg-secondary text-foreground"
        )}
      >
        <SaveIcon />
        프리셋
        {presets.length > 0 && (
          <span className="rounded-full bg-primary/20 px-1.5 text-[10px] text-primary">
            {presets.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-72 rounded-lg border border-border bg-popover shadow-xl">
          {/* 프리셋 목록 */}
          <div className="max-h-60 overflow-y-auto">
            {presets.length === 0 ? (
              <p className="p-4 text-center text-xs text-muted-foreground">
                저장된 프리셋이 없습니다
              </p>
            ) : (
              presets.map((preset) => (
                <div
                  key={preset.id}
                  className="group flex items-center justify-between gap-2 px-3 py-2 hover:bg-accent"
                >
                  <span className="flex-1 truncate text-xs text-foreground">{preset.name}</span>
                  <div className="flex shrink-0 items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => { applyPreset(preset.id); setOpen(false); }}
                      className="rounded bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground hover:bg-primary/80"
                    >
                      적용
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExport(preset.id)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      title="내보내기"
                    >
                      <DownloadIcon />
                    </button>
                    <button
                      type="button"
                      onClick={() => removePreset(preset.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors text-xs"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 액션 버튼 */}
          <div className="border-t border-border p-2 flex flex-col gap-1.5">
            {!showSaveForm ? (
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowSaveForm(true)}
                  className="flex-1 rounded border border-border py-1.5 text-xs text-foreground hover:bg-secondary transition-colors"
                >
                  현재 파라미터 저장
                </button>
                <button
                  type="button"
                  onClick={handleImport}
                  className="rounded border border-border px-2 py-1.5 text-xs text-muted-foreground hover:bg-secondary transition-colors"
                  title="JSON 가져오기"
                >
                  가져오기
                </button>
              </div>
            ) : (
              <div className="flex gap-1.5">
                <input
                  autoFocus
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") setShowSaveForm(false); }}
                  placeholder="프리셋 이름..."
                  className="flex-1 rounded border border-border bg-secondary px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <Button size="sm" onClick={handleSave}>저장</Button>
                <button
                  type="button"
                  onClick={() => setShowSaveForm(false)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
