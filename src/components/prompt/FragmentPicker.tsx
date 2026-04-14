import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/cn";
import { useFragmentStore } from "@/stores/fragment-store";

function TagIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

interface Props {
  /** 선택된 fragment를 현재 커서 위치에 삽입 */
  onInsert: (text: string) => void;
}

export default function FragmentPicker({ onInsert }: Props) {
  const { fragments, addFragment, deleteFragment } = useFragmentStore();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [newName, setNewName] = useState("");
  const [newContent, setNewContent] = useState("");
  const [addMode, setAddMode] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // 바깥 클릭 시 닫기
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setAddMode(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const filtered = fragments.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.content.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    if (!newContent.trim()) return;
    addFragment({ name: newName.trim() || newContent.slice(0, 20), content: newContent.trim() });
    setNewName("");
    setNewContent("");
    setAddMode(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex h-7 items-center gap-1 rounded-md border border-border px-2 text-xs",
          "text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors",
          open && "bg-secondary text-foreground"
        )}
        title="Fragment 삽입"
      >
        <TagIcon />
        <span>Fragment</span>
      </button>

      {open && (
        <div className="absolute bottom-full left-0 mb-1 z-50 w-64 rounded-lg border border-border bg-popover shadow-xl">
          {!addMode ? (
            <>
              {/* 검색 */}
              <div className="border-b border-border p-2">
                <input
                  autoFocus
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="검색..."
                  className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </div>

              {/* 목록 */}
              <div className="max-h-48 overflow-y-auto">
                {filtered.length === 0 ? (
                  <p className="p-3 text-center text-xs text-muted-foreground">
                    {fragments.length === 0 ? "Fragment가 없습니다." : "검색 결과 없음"}
                  </p>
                ) : (
                  filtered.map((f) => (
                    <div
                      key={f.id}
                      className="group flex items-center justify-between px-2 py-1.5 hover:bg-accent cursor-pointer"
                      onClick={() => {
                        onInsert(f.content);
                        setOpen(false);
                      }}
                    >
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium text-foreground">{f.name}</p>
                        <p className="truncate text-[10px] text-muted-foreground">{f.content.slice(0, 40)}</p>
                      </div>
                      {f.shortcutIndex && (
                        <span className="ml-1 shrink-0 rounded bg-secondary px-1 text-[10px] text-muted-foreground">
                          Ctrl+{f.shortcutIndex}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); deleteFragment(f.id); }}
                        className="ml-1 shrink-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* 추가 버튼 */}
              <div className="border-t border-border p-2">
                <button
                  type="button"
                  onClick={() => setAddMode(true)}
                  className="flex w-full items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <PlusIcon /> 새 Fragment 추가
                </button>
              </div>
            </>
          ) : (
            /* 추가 폼 */
            <div className="p-3 flex flex-col gap-2">
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="이름 (선택)"
                className="w-full rounded border border-border bg-secondary px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="프롬프트 내용..."
                rows={3}
                className="w-full resize-none rounded border border-border bg-secondary px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleAdd}
                  className="flex-1 rounded bg-primary px-2 py-1 text-xs text-primary-foreground hover:bg-primary/90"
                >
                  저장
                </button>
                <button
                  type="button"
                  onClick={() => setAddMode(false)}
                  className="flex-1 rounded border border-border px-2 py-1 text-xs text-foreground hover:bg-secondary"
                >
                  취소
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
