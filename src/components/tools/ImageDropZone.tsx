import { useRef } from "react";
import { cn } from "@/lib/cn";

function UploadIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

interface ImageDropZoneProps {
  base64: string | null;
  onLoad: (base64: string) => void;
  label?: string;
}

export default function ImageDropZone({ base64, onLoad, label = "이미지 업로드" }: ImageDropZoneProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const b64 = result.replace(/^data:[^;]+;base64,/, "");
      onLoad(b64);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) handleFile(file);
  };

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onClick={() => fileRef.current?.click()}
      className={cn(
        "relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors",
        "border-border hover:border-primary/50 hover:bg-secondary/50",
        "aspect-square"
      )}
    >
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      {base64 ? (
        <img
          src={`data:image/png;base64,${base64}`}
          alt="입력 이미지"
          className="h-full w-full rounded-lg object-contain"
          draggable={false}
        />
      ) : (
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <UploadIcon />
          <span className="text-xs">{label}</span>
          <span className="text-[10px] opacity-60">클릭 또는 드래그</span>
        </div>
      )}
    </div>
  );
}
