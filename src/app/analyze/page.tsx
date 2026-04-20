"use client";

import { useState, useRef, useCallback, type DragEvent } from "react";
import { resizeAndConvertToBase64 } from "@/lib/image-utils";

interface FashionItem {
  category: string;
  name: string;
  color: string;
  style: string;
  description: string;
}

const CATEGORY_EMOJI: Record<string, string> = {
  상의: "👕",
  하의: "👖",
  신발: "👟",
  모자: "🧢",
  가방: "👜",
  액세서리: "💍",
  헤어스타일: "💇",
};

const fileToBase64 = resizeAndConvertToBase64;

export default function AnalyzePage() {
  const [image, setImage] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [items, setItems] = useState<FashionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [searchLoading, setSearchLoading] = useState<Record<number, boolean>>({});
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    setPreview(URL.createObjectURL(file));
    setImage(await fileToBase64(file));
    setError(null);
    setItems([]);
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!image) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/recognize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "요청 실패");
      }
      const data = await res.json();
      setItems(data.items ?? data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
    } finally {
      setLoading(false);
    }
  }, [image]);

  const handleSearch = useCallback(async (item: FashionItem, idx: number) => {
    setSearchLoading((prev) => ({ ...prev, [idx]: true }));
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      window.open(data.url, "_blank");
    } catch {
      const keyword = `${item.color} ${item.name} ${item.style}`;
      window.open(`https://www.google.com/search?q=${encodeURIComponent(keyword)}&tbm=shop`, "_blank");
    } finally {
      setSearchLoading((prev) => ({ ...prev, [idx]: false }));
    }
  }, []);

  const handleDragEnter = (e: DragEvent) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = (e: DragEvent) => { e.preventDefault(); setDragging(false); };
  const handleDragOver = (e: DragEvent) => e.preventDefault();
  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="flex-1" style={{ background: "#ffffff" }}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-lg font-semibold" style={{ color: "#211922", letterSpacing: "-0.3px" }}>
              패션 아이템 인식
            </h1>
            <p className="mt-1 text-sm" style={{ color: "#62625b" }}>
              사진을 업로드하면 AI가 착용한 패션 아이템을 분석합니다.
            </p>
          </div>

          {/* Upload area */}
          <div
            onClick={() => inputRef.current?.click()}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            style={{
              borderRadius: 20,
              border: dragging ? "2px dashed #e60023" : "2px dashed #91918c",
              backgroundColor: dragging ? "#fef2f2" : "#f6f6f3",
              cursor: "pointer",
              transition: "border-color 0.2s, background-color 0.2s",
              minHeight: 220,
            }}
            className="flex flex-col items-center justify-center p-8 relative overflow-hidden"
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
            {preview ? (
              <img src={preview} alt="Preview" className="max-h-64 object-contain" style={{ borderRadius: 12 }} />
            ) : (
              <>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#91918c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="m21 15-5-5L5 21" />
                </svg>
                <p className="mt-3 text-sm font-medium" style={{ color: "#211922" }}>
                  이미지를 드래그하거나 클릭하여 업로드
                </p>
                <p className="mt-1 text-xs" style={{ color: "#91918c" }}>
                  JPG, PNG, WEBP (최대 10MB)
                </p>
              </>
            )}
          </div>

          {/* Analyze button */}
          <button
            onClick={handleAnalyze}
            disabled={!image || loading}
            className="self-stretch flex items-center justify-center gap-2 text-sm font-medium"
            style={{
              background: !image || loading ? "#e5e5e0" : "#e60023",
              color: !image || loading ? "#91918c" : "#ffffff",
              borderRadius: 16,
              padding: "12px 20px",
              border: "none",
              cursor: !image || loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="animate-spin" style={{ color: "#e60023" }}>
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.2" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
                분석 중...
              </>
            ) : (
              "분석하기"
            )}
          </button>

          {error && <p className="text-sm" style={{ color: "#e60023" }}>{error}</p>}

          {/* Results */}
          {items.length > 0 && (
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold" style={{ color: "#211922" }}>
                인식된 아이템 ({items.length})
              </h3>
              {items.map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-4" style={{ background: "#f6f6f3", borderRadius: 16 }}>
                  <span className="text-2xl leading-none mt-0.5">
                    {CATEGORY_EMOJI[item.category] ?? "👗"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold" style={{ color: "#211922" }}>{item.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#62625b" }}>{item.color} · {item.style}</p>
                    <p className="text-xs mt-1" style={{ color: "#91918c" }}>{item.description}</p>
                  </div>
                  <button
                    onClick={() => handleSearch(item, i)}
                    disabled={searchLoading[i]}
                    className="shrink-0 flex items-center gap-1.5 text-xs font-medium"
                    style={{
                      background: searchLoading[i] ? "#e5e5e0" : "#e5e5e0",
                      color: "#211922",
                      borderRadius: 12,
                      padding: "6px 14px",
                      border: "none",
                      cursor: searchLoading[i] ? "not-allowed" : "pointer",
                    }}
                  >
                    {searchLoading[i] ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="animate-spin" style={{ color: "#e60023" }}>
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.2" />
                        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                    )}
                    유사 상품
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
