"use client";

import { useState, useEffect, useCallback } from "react";

interface Member {
  id: number;
  email: string;
  name: string;
  credits: number;
  is_active: number;
  is_admin: number;
  style_count: number;
  fitting_count: number;
  created_at: string;
}

interface MemberDetail {
  member: {
    id: number;
    email: string;
    name: string;
    profile_image: string | null;
    credits: number;
    is_active: number;
    is_admin: number;
    created_at: string;
  };
  styles: { id: number; image_url: string; likes_count: number; is_hidden: number; created_at: string }[];
  fittings: { id: number; result_image: string | null; selected_items: string; created_at: string }[];
  creditHistory: { id: number; amount: number; type: string; description: string; status: string; created_at: string }[];
}

export default function AdminMembers() {
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<MemberDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/members?search=${encodeURIComponent(search)}&page=${page}`);
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members || []);
        setTotalPages(data.totalPages || 1);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const toggleActive = async (memberId: number, currentActive: number) => {
    try {
      const res = await fetch(`/api/admin/members/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: currentActive === 1 ? 0 : 1 }),
      });
      if (res.ok) {
        setMembers((prev) =>
          prev.map((m) =>
            m.id === memberId ? { ...m, is_active: currentActive === 1 ? 0 : 1 } : m
          )
        );
      }
    } catch {
      // ignore
    }
  };

  const toggleExpand = async (memberId: number) => {
    if (expandedId === memberId) {
      setExpandedId(null);
      setDetail(null);
      return;
    }
    setExpandedId(memberId);
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/members/${memberId}`);
      if (res.ok) {
        const data = await res.json();
        setDetail(data);
      }
    } catch {
      // ignore
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-5xl">
      <h1 className="text-xl font-semibold mb-6" style={{ color: "#211922" }}>
        회원 관리
      </h1>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <div
          className="flex items-center gap-2 flex-1 px-4 py-2"
          style={{ background: "#f6f6f3", borderRadius: 12 }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#91918c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="이름 또는 이메일로 검색..."
            className="flex-1 text-sm bg-transparent outline-none"
            style={{ color: "#211922" }}
          />
        </div>
        <button
          type="submit"
          className="text-sm font-medium px-4 shrink-0"
          style={{
            background: "#e5e5e0",
            color: "#211922",
            borderRadius: 12,
            border: "none",
            cursor: "pointer",
          }}
        >
          검색
        </button>
      </form>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="animate-spin" style={{ color: "#e60023" }}>
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.2" />
            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>
      ) : (
        <div style={{ border: "1px solid #e5e5e0", borderRadius: 16, overflow: "hidden" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ minWidth: 700 }}>
              <thead>
                <tr style={{ background: "#f6f6f3" }}>
                  <th className="text-left px-4 py-3 font-medium" style={{ color: "#62625b" }}>이름</th>
                  <th className="text-left px-4 py-3 font-medium" style={{ color: "#62625b" }}>이메일</th>
                  <th className="text-left px-4 py-3 font-medium" style={{ color: "#62625b" }}>가입일</th>
                  <th className="text-right px-4 py-3 font-medium" style={{ color: "#62625b" }}>크레딧</th>
                  <th className="text-right px-4 py-3 font-medium" style={{ color: "#62625b" }}>스타일</th>
                  <th className="text-center px-4 py-3 font-medium" style={{ color: "#62625b" }}>상태</th>
                  <th className="text-center px-4 py-3 font-medium" style={{ color: "#62625b" }}>액션</th>
                </tr>
              </thead>
              <tbody>
                {members.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12" style={{ color: "#62625b" }}>
                      검색 결과가 없습니다.
                    </td>
                  </tr>
                ) : (
                  members.map((m) => (
                    <>
                      <tr
                        key={m.id}
                        className="cursor-pointer transition-colors"
                        style={{ borderTop: "1px solid #e5e5e0" }}
                        onClick={() => toggleExpand(m.id)}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#f6f6f3")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div
                              className="flex items-center justify-center text-xs font-semibold shrink-0"
                              style={{
                                width: 28,
                                height: 28,
                                borderRadius: "50%",
                                background: "#e5e5e0",
                                color: "#211922",
                              }}
                            >
                              {m.name.charAt(0)}
                            </div>
                            <span style={{ color: "#211922", fontWeight: 500 }}>{m.name}</span>
                            {m.is_admin === 1 && (
                              <span
                                className="text-xs px-1.5 py-0.5"
                                style={{
                                  background: "#e60023",
                                  color: "#ffffff",
                                  borderRadius: 6,
                                  fontSize: 10,
                                }}
                              >
                                관리자
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3" style={{ color: "#62625b" }}>{m.email}</td>
                        <td className="px-4 py-3" style={{ color: "#62625b" }}>
                          {new Date(m.created_at).toLocaleDateString("ko-KR")}
                        </td>
                        <td className="px-4 py-3 text-right" style={{ color: "#211922", fontWeight: 500 }}>
                          {m.credits}
                        </td>
                        <td className="px-4 py-3 text-right" style={{ color: "#211922" }}>
                          {m.style_count}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className="text-xs px-2 py-0.5"
                            style={{
                              background: m.is_active ? "#103c2514" : "#e6002314",
                              color: m.is_active ? "#103c25" : "#e60023",
                              borderRadius: 8,
                            }}
                          >
                            {m.is_active ? "활성" : "비활성"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => toggleActive(m.id, m.is_active)}
                            className="text-xs px-3 py-1"
                            style={{
                              background: "transparent",
                              color: m.is_active ? "#e60023" : "#103c25",
                              border: "1px solid " + (m.is_active ? "#e60023" : "#103c25"),
                              borderRadius: 8,
                              cursor: "pointer",
                            }}
                          >
                            {m.is_active ? "비활성화" : "활성화"}
                          </button>
                        </td>
                      </tr>

                      {/* Expanded detail row */}
                      {expandedId === m.id && (
                        <tr key={`detail-${m.id}`}>
                          <td colSpan={7} style={{ background: "#f6f6f3", borderTop: "1px solid #e5e5e0" }}>
                            {detailLoading ? (
                              <div className="flex items-center justify-center py-8">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="animate-spin" style={{ color: "#e60023" }}>
                                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.2" />
                                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                                </svg>
                              </div>
                            ) : detail ? (
                              <div className="p-4 flex flex-col gap-4">
                                {/* Styles */}
                                <div>
                                  <h4 className="text-xs font-semibold mb-2" style={{ color: "#62625b" }}>
                                    스타일 ({detail.styles.length})
                                  </h4>
                                  {detail.styles.length === 0 ? (
                                    <p className="text-xs" style={{ color: "#91918c" }}>없음</p>
                                  ) : (
                                    <div className="flex gap-2 overflow-x-auto pb-1">
                                      {detail.styles.map((s) => (
                                        <div key={s.id} className="shrink-0" style={{ width: 60 }}>
                                          <img
                                            src={s.image_url}
                                            alt="Style"
                                            className="w-full object-cover"
                                            style={{
                                              height: 60,
                                              borderRadius: 8,
                                              opacity: s.is_hidden ? 0.4 : 1,
                                            }}
                                          />
                                          <div className="flex items-center gap-0.5 mt-0.5">
                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="#e60023" stroke="#e60023" strokeWidth="2">
                                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                            </svg>
                                            <span className="text-xs" style={{ color: "#91918c" }}>{s.likes_count}</span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {/* Credit History */}
                                <div>
                                  <h4 className="text-xs font-semibold mb-2" style={{ color: "#62625b" }}>
                                    크레딧 내역
                                  </h4>
                                  {detail.creditHistory.length === 0 ? (
                                    <p className="text-xs" style={{ color: "#91918c" }}>없음</p>
                                  ) : (
                                    <div className="flex flex-col gap-1">
                                      {detail.creditHistory.slice(0, 5).map((tx) => (
                                        <div key={tx.id} className="flex items-center justify-between text-xs">
                                          <span style={{ color: "#211922" }}>{tx.description}</span>
                                          <span style={{ color: tx.amount > 0 ? "#103c25" : "#e60023", fontWeight: 500 }}>
                                            {tx.amount > 0 ? "+" : ""}{tx.amount}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ) : null}
                          </td>
                        </tr>
                      )}
                    </>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div
              className="flex items-center justify-center gap-2 py-3"
              style={{ borderTop: "1px solid #e5e5e0" }}
            >
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
        </div>
      )}
    </div>
  );
}
