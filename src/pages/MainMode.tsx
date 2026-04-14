import GenerationPanel from "@/components/generation/GenerationPanel";
import ImagePreview from "@/components/generation/ImagePreview";

export default function MainMode() {
  return (
    <div className="flex h-full overflow-hidden">
      {/* 좌측: 생성 컨트롤 패널 */}
      <aside className="flex h-full w-80 shrink-0 flex-col border-r border-border bg-card">
        <GenerationPanel />
      </aside>

      {/* 우측: 이미지 프리뷰 */}
      <ImagePreview />
    </div>
  );
}
