"use client";

import { useState, useEffect, useCallback } from "react";

interface Transaction {
  id: number;
  amount: number;
  type: string;
  description: string;
  status: string;
  created_at: string;
  user_name: string;
  user_email: string;
}

interface SearchedUser {
  id: number;
  name: string;
  email: string;
  credits: number;
}

const PACKAGES = [
  { credits: 10, price: "1,000" },
  { credits: 30, price: "3,000" },
  { credits: 50, price: "5,000" },
];

export default function AdminCredits() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Manual adjustment
  const [userSearch, setUserSearch] = useState("");
  const [searchResults, setSearchResults] = useState<SearchedUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<SearchedUser | null>(null);
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustReason, setAdjustReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/credits?section=transactions&page=${page}`);
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions || []);
        setTotalPages(data.totalPages || 1);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const searchUsers = async () => {
    if (!userSearch.trim()) return;
    try {
      const res = await fetch(`/api/admin/members?search=${encodeURIComponent(userSearch)}&page=1`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(
          (data.members || []).map((m: { id: number; name: string; email: string; credits: number }) => ({
            id: m.id,
            name: m.name,
            email: m.email,
            credits: m.credits,
          }))
        );
      }
    } catch {
      // ignore
    }
  };

  const handleManualAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !adjustAmount || !adjustReason) return;

    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/credits/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          amount: parseInt(adjustAmount, 10),
          reason: adjustReason,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({
          type: "success",
          text: `${data.userName}님에게 ${data.adjustment > 0 ? "+" : ""}${data.adjustment} 크레딧 처리 완료 (잔액: ${data.newBalance})`,
        });
        setAdjustAmount("");
        setAdjustReason("");
        setSelectedUser(null);
        setSearchResults([]);
        setUserSearch("");
        fetchTransactions();
      } else {
        setMessage({ type: "error", text: data.error });
      }
    } catch {
      setMessage({ type: "error", text: "처리 중 오류가 발생했습니다." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-5xl">
      <h1 className="text-xl font-semibold mb-6" style={{ color: "#211922" }}>
        크레딧 관리
      </h1>

      {/* Package Settings */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold mb-3" style={{ color: "#211922" }}>
          크레딧 패키지 설정
        </h2>
        <div style={{ border: "1px solid #e5e5e0", borderRadius: 16, overflow: "hidden" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "#f6f6f3" }}>
                <th className="text-left px-4 py-3 font-medium" style={{ color: "#62625b" }}>패키지</th>
                <th className="text-right px-4 py-3 font-medium" style={{ color: "#62625b" }}>크레딧</th>
                <th className="text-right px-4 py-3 font-medium" style={{ color: "#62625b" }}>가격</th>
              </tr>
            </thead>
            <tbody>
              {PACKAGES.map((pkg, i) => (
                <tr key={i} style={{ borderTop: "1px solid #e5e5e0" }}>
                  <td className="px-4 py-3" style={{ color: "#211922" }}>{pkg.credits}크레딧 패키지</td>
                  <td className="px-4 py-3 text-right" style={{ color: "#211922", fontWeight: 500 }}>{pkg.credits}</td>
                  <td className="px-4 py-3 text-right" style={{ color: "#e60023" }}>{pkg.price}원</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-2" style={{ background: "#f6f6f3", borderTop: "1px solid #e5e5e0" }}>
            <p className="text-xs" style={{ color: "#91918c" }}>프로토타입 — 패키지 수정 기능은 추후 추가됩니다.</p>
          </div>
        </div>
      </div>

      {/* Manual Credit Adjustment */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold mb-3" style={{ color: "#211922" }}>
          수동 크레딧 지급/회수
        </h2>
        <form
          onSubmit={handleManualAdjust}
          className="p-5"
          style={{ border: "1px solid #e5e5e0", borderRadius: 16 }}
        >
          {/* User Search */}
          <div className="mb-4">
            <label className="text-xs font-medium mb-1.5 block" style={{ color: "#62625b" }}>대상 회원</label>
            {selectedUser ? (
              <div className="flex items-center gap-2">
                <div
                  className="flex items-center gap-2 flex-1 px-3 py-2"
                  style={{ background: "#f6f6f3", borderRadius: 10 }}
                >
                  <span className="text-sm font-medium" style={{ color: "#211922" }}>{selectedUser.name}</span>
                  <span className="text-xs" style={{ color: "#62625b" }}>{selectedUser.email}</span>
                  <span className="text-xs" style={{ color: "#91918c" }}>잔액: {selectedUser.credits}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedUser(null);
                    setSearchResults([]);
                    setUserSearch("");
                  }}
                  className="text-xs px-2 py-1"
                  style={{ background: "#e5e5e0", borderRadius: 8, border: "none", cursor: "pointer", color: "#211922" }}
                >
                  변경
                </button>
              </div>
            ) : (
              <div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); searchUsers(); } }}
                    placeholder="이름 또는 이메일 검색..."
                    className="flex-1 text-sm px-3 py-2 outline-none"
                    style={{ background: "#f6f6f3", borderRadius: 10, border: "none", color: "#211922" }}
                  />
                  <button
                    type="button"
                    onClick={searchUsers}
                    className="text-xs px-3 py-2"
                    style={{ background: "#e5e5e0", borderRadius: 10, border: "none", cursor: "pointer", color: "#211922" }}
                  >
                    검색
                  </button>
                </div>
                {searchResults.length > 0 && (
                  <div
                    className="mt-2 overflow-hidden"
                    style={{ border: "1px solid #e5e5e0", borderRadius: 10 }}
                  >
                    {searchResults.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => {
                          setSelectedUser(u);
                          setSearchResults([]);
                        }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-left text-sm transition-colors"
                        style={{ background: "transparent", border: "none", cursor: "pointer", borderBottom: "1px solid #e5e5e0" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#f6f6f3")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <span style={{ color: "#211922", fontWeight: 500 }}>{u.name}</span>
                        <span className="text-xs" style={{ color: "#62625b" }}>{u.email}</span>
                        <span className="text-xs ml-auto" style={{ color: "#91918c" }}>잔액: {u.credits}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Amount */}
          <div className="mb-4">
            <label className="text-xs font-medium mb-1.5 block" style={{ color: "#62625b" }}>
              수량 (양수: 지급, 음수: 회수)
            </label>
            <input
              type="number"
              value={adjustAmount}
              onChange={(e) => setAdjustAmount(e.target.value)}
              placeholder="예: 50 또는 -20"
              className="w-full text-sm px-3 py-2 outline-none"
              style={{ background: "#f6f6f3", borderRadius: 10, border: "none", color: "#211922" }}
            />
          </div>

          {/* Reason */}
          <div className="mb-4">
            <label className="text-xs font-medium mb-1.5 block" style={{ color: "#62625b" }}>사유</label>
            <input
              type="text"
              value={adjustReason}
              onChange={(e) => setAdjustReason(e.target.value)}
              placeholder="예: 이벤트 보상, 오류 보정 등"
              className="w-full text-sm px-3 py-2 outline-none"
              style={{ background: "#f6f6f3", borderRadius: 10, border: "none", color: "#211922" }}
            />
          </div>

          {message && (
            <div
              className="mb-4 px-3 py-2 text-xs"
              style={{
                background: message.type === "success" ? "#103c2514" : "#e6002314",
                color: message.type === "success" ? "#103c25" : "#e60023",
                borderRadius: 10,
              }}
            >
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={!selectedUser || !adjustAmount || !adjustReason || submitting}
            className="text-sm font-medium px-5 py-2"
            style={{
              background: selectedUser && adjustAmount && adjustReason ? "#e60023" : "#e5e5e0",
              color: selectedUser && adjustAmount && adjustReason ? "#ffffff" : "#91918c",
              borderRadius: 12,
              border: "none",
              cursor: selectedUser && adjustAmount && adjustReason && !submitting ? "pointer" : "not-allowed",
            }}
          >
            {submitting ? "처리 중..." : "크레딧 처리"}
          </button>
        </form>
      </div>

      {/* Charge History */}
      <div>
        <h2 className="text-sm font-semibold mb-3" style={{ color: "#211922" }}>
          충전 내역
        </h2>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="animate-spin" style={{ color: "#e60023" }}>
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.2" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
        ) : (
          <div style={{ border: "1px solid #e5e5e0", borderRadius: 16, overflow: "hidden" }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm" style={{ minWidth: 500 }}>
                <thead>
                  <tr style={{ background: "#f6f6f3" }}>
                    <th className="text-left px-4 py-3 font-medium" style={{ color: "#62625b" }}>회원</th>
                    <th className="text-right px-4 py-3 font-medium" style={{ color: "#62625b" }}>수량</th>
                    <th className="text-left px-4 py-3 font-medium" style={{ color: "#62625b" }}>내용</th>
                    <th className="text-left px-4 py-3 font-medium" style={{ color: "#62625b" }}>일시</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-12" style={{ color: "#62625b" }}>
                        충전 내역이 없습니다.
                      </td>
                    </tr>
                  ) : (
                    transactions.map((tx) => (
                      <tr key={tx.id} style={{ borderTop: "1px solid #e5e5e0" }}>
                        <td className="px-4 py-3">
                          <span style={{ color: "#211922", fontWeight: 500 }}>{tx.user_name}</span>
                        </td>
                        <td className="px-4 py-3 text-right" style={{ color: "#103c25", fontWeight: 500 }}>
                          +{tx.amount}
                        </td>
                        <td className="px-4 py-3" style={{ color: "#62625b" }}>{tx.description}</td>
                        <td className="px-4 py-3" style={{ color: "#91918c" }}>
                          {new Date(tx.created_at).toLocaleDateString("ko-KR")}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 py-3" style={{ borderTop: "1px solid #e5e5e0" }}>
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page <= 1}
                  className="text-xs px-3 py-1"
                  style={{
                    background: "#e5e5e0", borderRadius: 8, border: "none",
                    cursor: page <= 1 ? "not-allowed" : "pointer",
                    opacity: page <= 1 ? 0.5 : 1, color: "#211922",
                  }}
                >
                  이전
                </button>
                <span className="text-xs" style={{ color: "#62625b" }}>{page} / {totalPages}</span>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page >= totalPages}
                  className="text-xs px-3 py-1"
                  style={{
                    background: "#e5e5e0", borderRadius: 8, border: "none",
                    cursor: page >= totalPages ? "not-allowed" : "pointer",
                    opacity: page >= totalPages ? 0.5 : 1, color: "#211922",
                  }}
                >
                  다음
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
