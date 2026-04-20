"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { resizeAndConvertToBase64 } from "@/lib/image-utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";

interface StyleItem {
  id: number;
  user_id: number;
  image_url: string;
  analysis_json: string;
  likes_count: number;
  created_at: string;
  user_name: string;
  user_profile: string | null;
}

const fileToBase64 = resizeAndConvertToBase64;

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [styles, setStyles] = useState<StyleItem[]>([]);
  const [sort, setSort] = useState<"latest" | "popular">("latest");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchStyles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/styles?sort=${sort}&page=1`);
      const data = await res.json();
      setStyles(data.styles || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [sort]);

  useEffect(() => {
    fetchStyles();
  }, [fetchStyles]);

  const handleUpload = async (file: File) => {
    if (!user) {
      router.push("/login?redirect=/");
      return;
    }
    setUploading(true);
    try {
      const b64 = await fileToBase64(file);
      const res = await fetch("/api/styles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: b64 }),
      });
      if (res.ok) {
        fetchStyles();
      }
    } catch {
      // ignore
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-full" style={{ background: "#ffffff" }}>
      {/* Hero section */}
      <div className="px-4 sm:px-6 pt-8 pb-6 text-center">
        <h1
          className="text-2xl sm:text-3xl font-semibold"
          style={{ color: "#211922", letterSpacing: "-0.5px" }}
        >
          AI 패션 스타일 피드
        </h1>
        <p className="mt-2 text-sm" style={{ color: "#62625b" }}>
          다양한 스타일을 탐색하고, AI 가상 피팅을 체험하세요
        </p>
      </div>

      {/* Sort tabs */}
      <div className="px-4 sm:px-6 flex items-center gap-4" style={{ borderBottom: "1px solid #e5e5e0" }}>
        {(["latest", "popular"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSort(s)}
            className="pb-3 text-sm font-medium relative"
            style={{
              color: sort === s ? "#e60023" : "#62625b",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            {s === "latest" ? "최신순" : "인기순"}
            {sort === s && (
              <span
                className="absolute left-0 right-0 bottom-0"
                style={{ height: 2.5, borderRadius: 2, background: "#e60023" }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Masonry grid */}
      <div className="flex-1 px-4 sm:px-6 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              className="animate-spin"
              style={{ color: "#e60023" }}
            >
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.2" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
        ) : styles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#91918c" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-5-5L5 21" />
            </svg>
            <p className="text-sm" style={{ color: "#62625b" }}>
              아직 업로드된 스타일이 없습니다.
            </p>
          </div>
        ) : (
          <div
            className="columns-2 sm:columns-3 lg:columns-4 gap-4"
            style={{ columnFill: "balance" }}
          >
            {styles.map((style) => {
              let items: { name: string }[] = [];
              try {
                const parsed = JSON.parse(style.analysis_json);
                items = parsed.items || [];
              } catch {
                // ignore
              }

              return (
                <Link
                  key={style.id}
                  href={`/style/${style.id}`}
                  className="block mb-4 break-inside-avoid no-underline group"
                >
                  <div
                    className="overflow-hidden relative"
                    style={{
                      borderRadius: 16,
                      background: "#f6f6f3",
                    }}
                  >
                    {/* Image */}
                    <img
                      src={style.image_url}
                      alt={`Style by ${style.user_name}`}
                      className="w-full object-cover"
                      style={{ minHeight: 180 }}
                    />

                    {/* Hover overlay */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3"
                      style={{
                        background: "linear-gradient(transparent 40%, rgba(0,0,0,0.5))",
                      }}
                    >
                      {items.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {items.slice(0, 3).map((item, i) => (
                            <span
                              key={i}
                              className="text-xs px-2 py-0.5"
                              style={{
                                background: "rgba(255,255,255,0.85)",
                                borderRadius: 8,
                                color: "#211922",
                              }}
                            >
                              {item.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card info */}
                  <div className="flex items-center justify-between mt-2 px-1">
                    <div className="flex items-center gap-2">
                      <div
                        className="flex items-center justify-center text-xs font-semibold"
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          background: "#e5e5e0",
                          color: "#211922",
                        }}
                      >
                        {style.user_name.charAt(0)}
                      </div>
                      <span className="text-xs" style={{ color: "#211922" }}>
                        {style.user_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill={style.likes_count > 0 ? "#e60023" : "none"}
                        stroke={style.likes_count > 0 ? "#e60023" : "#91918c"}
                        strokeWidth="2"
                      >
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                      <span className="text-xs" style={{ color: "#91918c" }}>
                        {style.likes_count}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating upload button */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
        }}
      />
      <button
        onClick={() => {
          if (!user) {
            router.push("/login?redirect=/");
            return;
          }
          fileInputRef.current?.click();
        }}
        disabled={uploading}
        className="fixed bottom-8 right-6 sm:right-8 flex items-center gap-2 text-sm font-medium shadow-lg transition-transform hover:scale-105"
        style={{
          background: "#e60023",
          color: "#ffffff",
          borderRadius: 20,
          padding: "12px 24px",
          border: "none",
          cursor: uploading ? "not-allowed" : "pointer",
          zIndex: 40,
        }}
      >
        {uploading ? (
          <>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              className="animate-spin"
            >
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.3" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
            업로드 중...
          </>
        ) : (
          <>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            스타일 올리기
          </>
        )}
      </button>
    </div>
  );
}
