"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";

interface FashionItem {
  category: string;
  name: string;
  color: string;
  style: string;
  description: string;
}

interface StyleDetail {
  id: number;
  user_id: number;
  image_url: string;
  analysis_json: string;
  likes_count: number;
  created_at: string;
  user_name: string;
  user_profile: string | null;
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

const REPORT_REASONS = [
  "부적절한 이미지",
  "저작권 침해",
  "스팸/광고",
  "불쾌한 콘텐츠",
  "기타",
];

export default function StyleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const router = useRouter();

  const [style, setStyle] = useState<StyleDetail | null>(null);
  const [items, setItems] = useState<FashionItem[]>([]);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportDone, setReportDone] = useState(false);

  useEffect(() => {
    async function fetchStyle() {
      try {
        const res = await fetch(`/api/styles/${id}`);
        if (!res.ok) {
          router.push("/");
          return;
        }
        const data = await res.json();
        setStyle(data.style);
        setLikesCount(data.style.likes_count);

        try {
          const parsed = JSON.parse(data.style.analysis_json);
          setItems(parsed.items || []);
        } catch {
          // ignore
        }
      } catch {
        router.push("/");
      } finally {
        setLoading(false);
      }
    }
    fetchStyle();
  }, [id, router]);

  const handleLike = async () => {
    if (!user) {
      router.push(`/login?redirect=/style/${id}`);
      return;
    }

    try {
      const res = await fetch(`/api/styles/${id}/like`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setLiked(data.liked);
        setLikesCount(data.likes_count);
      }
    } catch {
      // ignore
    }
  };

  const handleReport = async () => {
    if (!reportReason) return;
    setReportSubmitting(true);
    try {
      const res = await fetch(`/api/styles/${id}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reportReason }),
      });
      if (res.ok) {
        setReportDone(true);
        setTimeout(() => {
          setReportModalOpen(false);
          setReportDone(false);
          setReportReason("");
        }, 1500);
      }
    } catch {
      // ignore
    } finally {
      setReportSubmitting(false);
    }
  };

  const handleSearchItem = (item: FashionItem) => {
    const keyword = `${item.color} ${item.name} ${item.style}`;
    const url = `https://www.google.com/search?q=${encodeURIComponent(keyword)}&tbm=shop`;
    window.open(url, "_blank");
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="animate-spin" style={{ color: "#e60023" }}>
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.2" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  if (!style) return null;

  return (
    <div className="flex-1" style={{ background: "#ffffff" }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm mb-6 no-underline"
          style={{ color: "#62625b" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          돌아가기
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image */}
          <div
            className="overflow-hidden"
            style={{ borderRadius: 20, background: "#f6f6f3" }}
          >
            <img
              src={style.image_url}
              alt={`Style by ${style.user_name}`}
              className="w-full object-cover"
            />
          </div>

          {/* Info */}
          <div className="flex flex-col gap-6">
            {/* User info */}
            <div className="flex items-center gap-3">
              <div
                className="flex items-center justify-center text-sm font-semibold"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "#e5e5e0",
                  color: "#211922",
                }}
              >
                {style.user_name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: "#211922" }}>
                  {style.user_name}
                </p>
                <p className="text-xs" style={{ color: "#91918c" }}>
                  {new Date(style.created_at).toLocaleDateString("ko-KR")}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleLike}
                className="flex items-center gap-2 text-sm font-medium"
                style={{
                  background: liked ? "#e60023" : "#f6f6f3",
                  color: liked ? "#ffffff" : "#211922",
                  borderRadius: 16,
                  padding: "8px 20px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill={liked ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                {likesCount}
              </button>

              <Link
                href={`/fitting?style=${style.id}`}
                className="flex items-center gap-2 text-sm font-medium no-underline"
                style={{
                  background: "#e60023",
                  color: "#ffffff",
                  borderRadius: 16,
                  padding: "8px 20px",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 3v12" />
                  <path d="M18 9a3 3 0 0 1-3 3H6" />
                </svg>
                가상 피팅 해보기
              </Link>

              <button
                onClick={() => {
                  if (!user) {
                    router.push(`/login?redirect=/style/${id}`);
                    return;
                  }
                  setReportModalOpen(true);
                }}
                className="flex items-center gap-1 text-xs"
                style={{
                  background: "none",
                  color: "#91918c",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                  <line x1="4" y1="22" x2="4" y2="15" />
                </svg>
                신고
              </button>
            </div>

            {/* Items */}
            {items.length > 0 && (
              <div className="flex flex-col gap-3">
                <h3 className="text-sm font-semibold" style={{ color: "#211922" }}>
                  인식된 아이템 ({items.length})
                </h3>
                {items.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3"
                    style={{ background: "#f6f6f3", borderRadius: 16 }}
                  >
                    <span className="text-xl mt-0.5">
                      {CATEGORY_EMOJI[item.category] ?? "👗"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium" style={{ color: "#211922" }}>
                        {item.name}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "#62625b" }}>
                        {item.color} · {item.style}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "#91918c" }}>
                        {item.description}
                      </p>
                    </div>
                    <button
                      onClick={() => handleSearchItem(item)}
                      className="shrink-0 text-xs font-medium"
                      style={{
                        background: "#e5e5e0",
                        color: "#211922",
                        borderRadius: 12,
                        padding: "6px 12px",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      유사 상품 보기
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {reportModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,0.4)" }}
          onClick={() => setReportModalOpen(false)}
        >
          <div
            className="w-full max-w-sm p-6"
            style={{ background: "#ffffff", borderRadius: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            {reportDone ? (
              <div className="flex flex-col items-center gap-3 py-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#e60023" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <p className="text-sm font-medium" style={{ color: "#211922" }}>
                  신고가 접수되었습니다.
                </p>
              </div>
            ) : (
              <>
                <h3 className="text-base font-semibold mb-4" style={{ color: "#211922" }}>
                  스타일 신고
                </h3>
                <div className="flex flex-col gap-2 mb-4">
                  {REPORT_REASONS.map((reason) => (
                    <button
                      key={reason}
                      onClick={() => setReportReason(reason)}
                      className="text-left text-sm p-3 transition-colors"
                      style={{
                        background: reportReason === reason ? "#e60023" : "#f6f6f3",
                        color: reportReason === reason ? "#ffffff" : "#211922",
                        borderRadius: 12,
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      {reason}
                    </button>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setReportModalOpen(false)}
                    className="flex-1 text-sm font-medium"
                    style={{
                      background: "#e5e5e0",
                      color: "#211922",
                      borderRadius: 16,
                      padding: "10px",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    취소
                  </button>
                  <button
                    onClick={handleReport}
                    disabled={!reportReason || reportSubmitting}
                    className="flex-1 text-sm font-medium"
                    style={{
                      background: !reportReason || reportSubmitting ? "#e5e5e0" : "#e60023",
                      color: !reportReason || reportSubmitting ? "#91918c" : "#ffffff",
                      borderRadius: 16,
                      padding: "10px",
                      border: "none",
                      cursor: !reportReason || reportSubmitting ? "not-allowed" : "pointer",
                    }}
                  >
                    {reportSubmitting ? "처리 중..." : "신고하기"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
