import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { useLibraryStore, type LibraryImage } from "@/stores/library-store";
import { useSettingsStore } from "@/stores/settings-store";
import { MODEL_LABELS, SAMPLER_LABELS } from "@/stores/settings-store";

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-start justify-between gap-2 py-1 text-xs">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="text-right text-foreground break-all">{value}</span>
    </div>
  );
}

interface Props {
  image: LibraryImage;
}

export default function MetadataPanel({ image }: Props) {
  const { deleteImage } = useLibraryStore();
  const { update } = useSettingsStore();

  const applyParams = () => {
    update({
      model: image.params.model,
      prompt: image.params.prompt,
      negativePrompt: image.params.negativePrompt,
      width: image.params.width,
      height: image.params.height,
      steps: image.params.steps,
      cfgScale: image.params.cfgScale,
      sampler: image.params.sampler,
      seed: image.params.seed,
      noiseSchedule: image.params.noiseSchedule,
      qualityToggle: image.params.qualityToggle,
      smea: image.params.smea,
      smeaDyn: image.params.smeaDyn,
    });
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="shrink-0 border-b border-border px-3 py-2">
        <p className="text-xs font-medium text-foreground">메타데이터</p>
        <p className="text-[10px] text-muted-foreground">
          {new Date(image.createdAt).toLocaleString("ko-KR")}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <div className="divide-y divide-border/50">
          <Row label="모델" value={MODEL_LABELS[image.params.model] ?? image.params.model} />
          <Row label="해상도" value={`${image.params.width}×${image.params.height}`} />
          <Row label="스텝" value={image.params.steps} />
          <Row label="CFG" value={image.params.cfgScale} />
          <Row label="샘플러" value={SAMPLER_LABELS[image.params.sampler] ?? image.params.sampler} />
          <Row label="노이즈" value={image.params.noiseSchedule} />
          <Row label="시드" value={image.params.seed} />
          {image.tool && <Row label="도구" value={image.tool} />}
        </div>

        <div className="mt-3">
          <p className="mb-1 text-[10px] text-muted-foreground">프롬프트</p>
          <p className={cn(
            "rounded-md border border-border bg-secondary/50 p-2 text-[10px] text-foreground leading-relaxed",
            "max-h-24 overflow-y-auto"
          )}>
            {image.params.prompt || "(없음)"}
          </p>
        </div>

        {image.params.negativePrompt && (
          <div className="mt-2">
            <p className="mb-1 text-[10px] text-muted-foreground">네거티브</p>
            <p className={cn(
              "rounded-md border border-border bg-secondary/50 p-2 text-[10px] text-foreground leading-relaxed",
              "max-h-16 overflow-y-auto"
            )}>
              {image.params.negativePrompt}
            </p>
          </div>
        )}
      </div>

      <div className="flex shrink-0 flex-col gap-1.5 border-t border-border p-3">
        <Button className="w-full" size="sm" onClick={applyParams}>
          이 파라미터로 생성
        </Button>
        <Button
          variant="destructive"
          size="sm"
          className="w-full"
          onClick={() => deleteImage(image.id)}
        >
          삭제
        </Button>
      </div>
    </div>
  );
}
