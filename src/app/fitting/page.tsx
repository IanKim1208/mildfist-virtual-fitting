"use client";

import { useState, useRef, useCallback, useEffect, Suspense, type DragEvent } from "react";
import { resizeAndConvertToBase64 } from "@/lib/image-utils";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/components/AuthContext";

const CATEGORY_EMOJI: Record<string, string> = {
  상의: "👕",
  하의: "👖",
  신발: "👟",
  모자: "🧢",
  가방: "👜",
  액세서리: "💍",
  헤어스타일: "💇",
};

interface FashionItem {
  category: string;
  name: string;
  color: string;
  style: string;
  description: string;
}

const fileToBase64 = resizeAndConvertToBase64;

export default function FittingPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="animate-spin" style={{ color: "#e60023" }}>
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.2" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>
    }>
      <FittingPageInner />
    </Suspense>
  );
}

function FittingPageInner() {
  const searchParams = useSearchParams();
  const styleId = searchParams.get("style");
  const { refresh } = useAuth();

  const [myImage, setMyImage] = useState<string | null>(null);
  const [myPreview, setMyPreview] = useState<string | null>(null);
  const [styleImage, setStyleImage] = useState<string | null>(null);
  const [stylePreview, setStylePreview] = useState<string | null>(null);
  const [recognizedItems, setRecognizedItems] = useState<FashionItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [fittingResult, setFittingResult] = useState<string | null>(null);
  const [fitLoading, setFitLoading] = useState(false);
  const [fitError, setFitError] = useState<string | null>(null);
  const [myDragging, setMyDragging] = useState(false);
  const [styleDragging, setStyleDragging] = useState(false);

  const myInputRef = useRef<HTMLInputElement>(null);
  const styleInputRef = useRef<HTMLInputElement>(null);

  // Load style if coming from style detail page
  useEffect(() => {
    if (!styleId) return;
    async function loadStyle() {
      try {
        const res = await fetch(`/api/styles/${styleId}`);
        if (!res.ok) return;
        const data = await res.json();
        const style = data.style;
        setStylePreview(style.image_url);
        // For base64 data URLs, extract the base64 part
        if (style.image_url.startsWith("data:")) {
          setStyleImage(style.image_url.split(",")[1]);
        }
        // Load analysis items
        try {
          const parsed = JSON.parse(style.analysis_json);
          if (parsed.items) {
            setRecognizedItems(parsed.items);
          }
        } catch {
          // ignore
        }
      } catch {
        // ignore
      }
    }
    loadStyle();
  }, [styleId]);

  const handleMyFile = useCallback(async (file: File) => {
    setMyPreview(URL.createObjectURL(file));
    setMyImage(await fileToBase64(file));
  }, []);

  const handleStyleFile = useCallback(async (file: File) => {
    setStylePreview(URL.createObjectURL(file));
    const b64 = await fileToBase64(file);
    setStyleImage(b64);
    // Auto-recognize items
    try {
      const res = await fetch("/api/recognize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: b64 }),
      });
      if (res.ok) {
        const data = await res.json();
        setRecognizedItems(data.items ?? data);
      }
    } catch {
      // ignore
    }
  }, []);

  const toggleItem = useCallback((category: string, name: string) => {
    const label = `${category}: ${name}`;
    setSelectedItems((prev) =>
      prev.includes(label) ? prev.filter((n) => n !== label) : [...prev, label]
    );
  }, []);

  const handleFitting = useCallback(async () => {
    if (!myImage || !styleImage || selectedItems.length === 0) return;
    setFitLoading(true);
    setFitError(null);
    setFittingResult(null);

    // Use credits
    try {
      const creditRes = await fetch("/api/credits/use", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 1, description: "가상 피팅" }),
      });
      if (!creditRes.ok) {
        const err = await creditRes.json();
        setFitError(err.error || "크레딧이 부족합니다.");
        setFitLoading(false);
        return;
      }
    } catch {
      setFitError("크레딧 사용 중 오류가 발생했습니다.");
      setFitLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/fitting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ myImage, styleImage, selectedItems }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "요청 실패");
      }
      const data = await res.json();
      if (data.image) {
        setFittingResult(`data:image/png;base64,${data.image}`);
        // Save fitting result
        try {
          await fetch("/api/fittings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              myImage,
              styleImage,
              resultImage: data.image,
              selectedItems,
            }),
          });
        } catch {
          // ignore save error
        }
        // Refresh user credits
        refresh();
      } else {
        throw new Error("이미지 생성 결과가 없습니다.");
      }
    } catch (err: unknown) {
      setFitError(err instanceof Error ? err.message : "알 수 없는 오류");
    } finally {
      setFitLoading(false);
    }
  }, [myImage, styleImage, selectedItems, refresh]);

  const makeDragHandlers = (setDragging: (v: boolean) => void) => ({
    onDragEnter: (e: DragEvent) => { e.preventDefault(); setDragging(true); },
    onDragLeave: (e: DragEvent) => { e.preventDefault(); setDragging(false); },
    onDragOver: (e: DragEvent) => e.preventDefault(),
  });

  const disabled = !myImage || !styleImage || selectedItems.length === 0 || fitLoading;

  return (
    <div className="flex-1" style={{ background: "#ffffff" }}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-lg font-semibold" style={{ color: "#211922", letterSpacing: "-0.3px" }}>
              가상 피팅
            </h1>
            <p className="mt-1 text-sm" style={{ color: "#62625b" }}>
              내 사진과 스타일 사진을 업로드한 후, 입혀볼 아이템을 선택하세요.
            </p>
          </div>

          {/* Two upload areas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium" style={{ color: "#211922" }}>내 사진</span>
              <div
                onClick={() => myInputRef.current?.click()}
                {...makeDragHandlers(setMyDragging)}
                onDrop={(e: DragEvent) => {
                  e.preventDefault();
                  setMyDragging(false);
                  const file = e.dataTransfer.files[0];
                  if (file) handleMyFile(file);
                }}
                style={{
                  borderRadius: 20,
                  border: myDragging ? "2px dashed #e60023" : "2px dashed #91918c",
                  backgroundColor: myDragging ? "#fef2f2" : "#f6f6f3",
                  cursor: "pointer",
                  minHeight: 200,
                }}
                className="flex flex-col items-center justify-center p-6 overflow-hidden"
              >
                <input ref={myInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleMyFile(f); }} />
                {myPreview ? (
                  <img src={myPreview} alt="My photo" className="max-h-48 object-contain" style={{ borderRadius: 12 }} />
                ) : (
                  <>
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#91918c" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></svg>
                    <p className="mt-2 text-xs font-medium" style={{ color: "#211922" }}>내 사진 업로드</p>
                    <p className="text-xs mt-0.5" style={{ color: "#91918c" }}>정면 전신 사진 권장</p>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium" style={{ color: "#211922" }}>스타일 사진</span>
              <div
                onClick={() => !styleId ? styleInputRef.current?.click() : undefined}
                {...makeDragHandlers(setStyleDragging)}
                onDrop={(e: DragEvent) => {
                  e.preventDefault();
                  setStyleDragging(false);
                  const file = e.dataTransfer.files[0];
                  if (file) handleStyleFile(file);
                }}
                style={{
                  borderRadius: 20,
                  border: styleDragging ? "2px dashed #e60023" : "2px dashed #91918c",
                  backgroundColor: styleDragging ? "#fef2f2" : "#f6f6f3",
                  cursor: "pointer",
                  minHeight: 200,
                }}
                className="flex flex-col items-center justify-center p-6 overflow-hidden"
              >
                <input ref={styleInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleStyleFile(f); }} />
                {stylePreview ? (
                  <img src={stylePreview} alt="Style" className="max-h-48 object-contain" style={{ borderRadius: 12 }} />
                ) : (
                  <>
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#91918c" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></svg>
                    <p className="mt-2 text-xs font-medium" style={{ color: "#211922" }}>스타일 사진 업로드</p>
                    <p className="text-xs mt-0.5" style={{ color: "#91918c" }}>참고할 코디 사진</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Item selection */}
          {recognizedItems.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium" style={{ color: "#211922" }}>피팅할 아이템 선택</span>
              <div className="flex flex-wrap gap-2">
                {recognizedItems.map((item, i) => {
                  const label = `${item.category}: ${item.name}`;
                  const selected = selectedItems.includes(label);
                  return (
                    <button
                      key={i}
                      onClick={() => toggleItem(item.category, item.name)}
                      className="flex items-center gap-1.5 text-xs font-medium"
                      style={{
                        background: selected ? "#e60023" : "#e5e5e0",
                        color: selected ? "#ffffff" : "#211922",
                        borderRadius: 12,
                        padding: "6px 14px",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      {CATEGORY_EMOJI[item.category] ?? "👗"} {item.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {recognizedItems.length === 0 && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 p-4" style={{ background: "#f6f6f3", borderRadius: 16 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#91918c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p className="text-xs" style={{ color: "#62625b" }}>
                  스타일 사진을 업로드하면 AI가 자동으로 아이템을 인식합니다. 직접 입력도 가능합니다.
                </p>
              </div>
              <span className="text-xs font-medium" style={{ color: "#211922" }}>피팅할 아이템 직접 입력</span>
              <input
                type="text"
                placeholder='예: 검정 가죽 자켓, 흰색 티셔츠 (쉼표로 구분)'
                className="text-sm outline-none"
                style={{
                  border: "1px solid #91918c",
                  borderRadius: 16,
                  padding: "10px 16px",
                  color: "#211922",
                  background: "#ffffff",
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const val = (e.target as HTMLInputElement).value.trim();
                    if (val) setSelectedItems(val.split(",").map((s) => s.trim()).filter(Boolean));
                  }
                }}
                onBlur={(e) => {
                  const val = e.target.value.trim();
                  if (val) setSelectedItems(val.split(",").map((s) => s.trim()).filter(Boolean));
                }}
              />
            </div>
          )}

          {/* Fitting button */}
          <button
            onClick={handleFitting}
            disabled={disabled}
            className="self-stretch flex items-center justify-center gap-2 text-sm font-medium"
            style={{
              background: disabled ? "#e5e5e0" : "#e60023",
              color: disabled ? "#91918c" : "#ffffff",
              borderRadius: 16,
              padding: "12px 20px",
              border: "none",
              cursor: disabled ? "not-allowed" : "pointer",
            }}
          >
            {fitLoading ? (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="animate-spin" style={{ color: "#e60023" }}>
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.2" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
                피팅 중... (최대 30초 소요)
              </>
            ) : (
              <>
                피팅 시작
                <span className="text-xs opacity-70">(1 크레딧)</span>
              </>
            )}
          </button>

          {fitError && <p className="text-sm" style={{ color: "#e60023" }}>{fitError}</p>}

          {/* Result */}
          {fittingResult && (
            <div className="flex flex-col items-center gap-4">
              <h3 className="text-sm font-semibold self-start" style={{ color: "#211922" }}>
                피팅 결과
              </h3>
              <div className="w-full overflow-hidden" style={{ borderRadius: 20, border: "1px solid #e5e5e0" }}>
                <img src={fittingResult} alt="피팅 결과" className="w-full object-contain" />
              </div>
              <a
                href={fittingResult}
                download="mildfist-fitting-result.png"
                className="flex items-center gap-2 text-xs font-medium no-underline"
                style={{
                  background: "#e5e5e0",
                  color: "#211922",
                  borderRadius: 12,
                  padding: "8px 20px",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                이미지 다운로드
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
