import { useLibraryStore } from "@/stores/library-store";
import ImageGrid from "@/components/library/ImageGrid";
import MetadataPanel from "@/components/library/MetadataPanel";

export default function Library() {
  const { images, selectedId } = useLibraryStore();
  const selectedImage = images.find((img) => img.id === selectedId) ?? null;

  return (
    <div className="flex h-full overflow-hidden">
      {/* 이미지 그리드 (좌측) */}
      <div className="flex-1 overflow-hidden border-r border-border">
        <ImageGrid />
      </div>

      {/* 메타데이터 패널 (우측) */}
      <div className="w-56 shrink-0 overflow-hidden">
        {selectedImage ? (
          <MetadataPanel image={selectedImage} />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground p-4 text-center">
            이미지를 선택하면<br />메타데이터가 표시됩니다
          </div>
        )}
      </div>
    </div>
  );
}
