"use client";

import { useState, useEffect, useCallback } from "react";

type Tab = "all" | "reports";

interface ContentItem {
  id: number;
  image_url: string;
  likes_count: number;
  is_hidden: number;
  created_at: string;
  user_name: string;
  user_email: string;
}

interface ReportItem {
  id: number;
  reason: string;
  status: string;
  created_at: string;
  style_id: number;
  reporter_name: string;
  reporter_email: string;
  style_image: string;
  style_hidden: number;
  style_owner_name: string;
}

export default function AdminContents() {
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/contents?tab=${activeTab}&page=${page}`);
      if (res.ok) {
        const data = await res.json();
        if (activeTab === "all") {
          setContents(data.contents || []);
        } else {
          setReports(data.reports || []);
        }
        setTotalPages(data.totalPages || 1);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [activeTab, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleContentAction = async (styleId: number, action: "hide" | "unhide" | "delete") => {
    try {
      const res = await fetch(`/api/admin/contents/${styleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        if (action === "delete") {
          setContents((prev) => prev.filter((c) => c.id !== styleId));
        } else if (action === "hide") {
          setContents((prev) => prev.map((c) => c.id === styleId ? { ...c, is_hidden: 1 } : c));
        } else {
          setContents((prev) => prev.map((c) => c.id === styleId ? { ...c, is_hidden: 0 } : c));
        }
      }
    } catch {
      // ignore
    }
  };

  const handleReportAction = async (reportId: number, action: "hide_content" | "dismiss") => {
    try {
      const res = await fetch(`/api/admin/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        setReports((prev) => prev.filter((r) => r.id !== reportId));
      }
    } catch {
      // ignore
    }
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "all", label: "전체 콘텐츠" },
    { key: "reports", label: "신고 접수" },
  ];

  return (
    <div className="p-6 sm:p-8 max-w-5xl">
      <h1 className="text-xl font-semibold mb-6" style={{ color: "#211922" }}>
        콘텐츠 관리
      </h1>

      {/* Tabs */}
      <nav className="flex gap-6 mb-6" style={{ borderBottom: "1px solid #e5e5e0" }}>
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => { setActiveTab(t.key); setPage(1); }}
            className="pb-3 text-sm font-medium relative"
            style={{
              color: activeTab === t.key ? "#e60023" : "#62625b",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            {t.label}
            {activeTab === t.key && (
              <span
                className="absolute left-0 right-0 bottom-0"
                style={{ height: 2.5, borderRadius: 2, background: "#e60023" }}
              />
            )}
          </button>
        ))}
      </nav>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="animate-spin" style={{ color: "#e60023" }}>
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.2" />
            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>
      ) : (
        <>
          {/* All Contents */}
          {activeTab === "all" && (
            <>
              {contents.length === 0 ? (
                <div className="flex items-center justify-center py-16">
                  <p className="text-sm" style={{ color: "#62625b" }}>콘텐츠가 없습니다.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {contents.map((c) => (
                    <div
                      key={c.id}
                      className="flex flex-col"
                      style={{
                        border: "1px solid #e5e5e0",
                        borderRadius: 16,
                        overflow: "hidden",
                        opacity: c.is_hidden ? 0.5 : 1,
                      }}
                    >
                      <div className="relative">
                        <img
                          src={c.image_url}
                          alt="Style"
                          className="w-full object-cover"
                          style={{ height: 140, background: "#f6f6f3" }}
                        />
                        {c.is_hidden === 1 && (
                          <div
                            className="absolute inset-0 flex items-center justify-center"
                            style={{ background: "rgba(0,0,0,0.4)" }}
                          >
                            <span className="text-xs font-medium" style={{ color: "#ffffff" }}>숨김 처리됨</span>
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium" style={{ color: "#211922" }}>{c.user_name}</span>
                          <div className="flex items-center gap-1">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="#e60023" stroke="#e60023" strokeWidth="2">
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
                            <span className="text-xs" style={{ color: "#91918c" }}>{c.likes_count}</span>
                          </div>
                        </div>
                        <p className="text-xs mb-3" style={{ color: "#91918c" }}>
                          {new Date(c.created_at).toLocaleDateString("ko-KR")}
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleContentAction(c.id, c.is_hidden ? "unhide" : "hide")}
                            className="text-xs px-2 py-1 flex-1"
                            style={{
                              background: "transparent",
                              color: c.is_hidden ? "#103c25" : "#e60023",
                              border: "1px solid " + (c.is_hidden ? "#103c25" : "#e5e5e0"),
                              borderRadius: 8,
                              cursor: "pointer",
                            }}
                          >
                            {c.is_hidden ? "숨김 해제" : "숨김"}
                          </button>
                          <button
                            onClick={() => {
                              if (confirm("정말 삭제하시겠습니까?")) {
                                handleContentAction(c.id, "delete");
                              }
                            }}
                            className="text-xs px-2 py-1"
                            style={{
                              background: "transparent",
                              color: "#e60023",
                              border: "1px solid #e5e5e0",
                              borderRadius: 8,
                              cursor: "pointer",
                            }}
                          >
                            삭제
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Reports */}
          {activeTab === "reports" && (
            <>
              {reports.length === 0 ? (
                <div className="flex items-center justify-center py-16">
                  <p className="text-sm" style={{ color: "#62625b" }}>접수된 신고가 없습니다.</p>
                </div>
              ) : (
                <div style={{ border: "1px solid #e5e5e0", borderRadius: 16, overflow: "hidden" }}>
                  <div className="divide-y" style={{ borderColor: "#e5e5e0" }}>
                    {reports.map((r) => (
                      <div key={r.id} className="flex items-center gap-4 p-4">
                        <img
                          src={r.style_image}
                          alt="Reported style"
                          className="shrink-0 object-cover"
                          style={{ width: 56, height: 56, borderRadius: 8, background: "#f6f6f3" }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm" style={{ color: "#211922" }}>
                            <strong>{r.reporter_name}</strong>
                            <span style={{ color: "#62625b" }}> 님이 </span>
                            <strong>{r.style_owner_name}</strong>
                            <span style={{ color: "#62625b" }}> 님의 스타일을 신고</span>
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: "#62625b" }}>
                            사유: {r.reason}
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: "#91918c" }}>
                            {new Date(r.created_at).toLocaleDateString("ko-KR")}
                          </p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => handleReportAction(r.id, "hide_content")}
                            className="text-xs px-3 py-1.5"
                            style={{
                              background: "transparent",
                              color: "#e60023",
                              border: "1px solid #e60023",
                              borderRadius: 8,
                              cursor: "pointer",
                            }}
                          >
                            콘텐츠 숨김
                          </button>
                          <button
                            onClick={() => handleReportAction(r.id, "dismiss")}
                            className="text-xs px-3 py-1.5"
                            style={{
                              background: "#e5e5e0",
                              color: "#211922",
                              border: "none",
                              borderRadius: 8,
                              cursor: "pointer",
                            }}
                          >
                            무시
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 py-6">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="text-xs px-3 py-1"
                style={{
                  background: "#e5e5e0",
                  borderRadius: 8,
                  border: "none",
                  cursor: page <= 1 ? "not-allowed" : "pointer",
                  opacity: page <= 1 ? 0.5 : 1,
                  color: "#211922",
                }}
              >
                이전
              </button>
              <span className="text-xs" style={{ color: "#62625b" }}>
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                className="text-xs px-3 py-1"
                style={{
                  background: "#e5e5e0",
                  borderRadius: 8,
                  border: "none",
                  cursor: page >= totalPages ? "not-allowed" : "pointer",
                  opacity: page >= totalPages ? 0.5 : 1,
                  color: "#211922",
                }}
              >
                다음
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
