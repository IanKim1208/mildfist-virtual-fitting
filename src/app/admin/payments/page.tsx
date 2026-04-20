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

interface DailyStat {
  day: string;
  count: number;
  total: number;
}

interface MonthlyStat {
  month: string;
  count: number;
  total: number;
}

type Tab = "transactions" | "stats";

export default function AdminPayments() {
  const [activeTab, setActiveTab] = useState<Tab>("transactions");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refunding, setRefunding] = useState<number | null>(null);

  // Stats
  const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStat[]>([]);
  const [statsLoading, setStatsLoading] = useState(false);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/payments?tab=transactions&page=${page}`);
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

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await fetch("/api/admin/payments?tab=stats");
      if (res.ok) {
        const data = await res.json();
        setDailyStats(data.dailyStats || []);
        setMonthlyStats(data.monthlyStats || []);
      }
    } catch {
      // ignore
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "transactions") {
      fetchTransactions();
    } else {
      fetchStats();
    }
  }, [activeTab, fetchTransactions, fetchStats]);

  const handleRefund = async (transactionId: number) => {
    if (!confirm("정말 환불 처리하시겠습니까?")) return;
    setRefunding(transactionId);
    try {
      const res = await fetch(`/api/admin/payments/${transactionId}/refund`, {
        method: "POST",
      });
      if (res.ok) {
        // Update the transaction in list
        setTransactions((prev) =>
          prev.map((tx) =>
            tx.id === transactionId ? { ...tx, status: "refunded" } : tx
          )
        );
      } else {
        const data = await res.json();
        alert(data.error || "환불 처리에 실패했습니다.");
      }
    } catch {
      alert("환불 처리 중 오류가 발생했습니다.");
    } finally {
      setRefunding(null);
    }
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "transactions", label: "결제 내역" },
    { key: "stats", label: "매출 통계" },
  ];

  const priceMap: Record<number, string> = { 10: "1,000", 30: "3,000", 50: "5,000" };

  return (
    <div className="p-6 sm:p-8 max-w-5xl">
      <h1 className="text-xl font-semibold mb-6" style={{ color: "#211922" }}>
        결제 관리
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

      {/* Transactions Tab */}
      {activeTab === "transactions" && (
        <>
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
                <table className="w-full text-sm" style={{ minWidth: 650 }}>
                  <thead>
                    <tr style={{ background: "#f6f6f3" }}>
                      <th className="text-left px-4 py-3 font-medium" style={{ color: "#62625b" }}>ID</th>
                      <th className="text-left px-4 py-3 font-medium" style={{ color: "#62625b" }}>회원</th>
                      <th className="text-right px-4 py-3 font-medium" style={{ color: "#62625b" }}>크레딧</th>
                      <th className="text-right px-4 py-3 font-medium" style={{ color: "#62625b" }}>금액</th>
                      <th className="text-center px-4 py-3 font-medium" style={{ color: "#62625b" }}>상태</th>
                      <th className="text-left px-4 py-3 font-medium" style={{ color: "#62625b" }}>일시</th>
                      <th className="text-center px-4 py-3 font-medium" style={{ color: "#62625b" }}>액션</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-12" style={{ color: "#62625b" }}>
                          결제 내역이 없습니다.
                        </td>
                      </tr>
                    ) : (
                      transactions.map((tx) => (
                        <tr key={tx.id} style={{ borderTop: "1px solid #e5e5e0" }}>
                          <td className="px-4 py-3" style={{ color: "#91918c" }}>#{tx.id}</td>
                          <td className="px-4 py-3">
                            <span style={{ color: "#211922", fontWeight: 500 }}>{tx.user_name}</span>
                          </td>
                          <td className="px-4 py-3 text-right" style={{
                            color: tx.type === "refund" ? "#e60023" : "#103c25",
                            fontWeight: 500,
                          }}>
                            {tx.amount > 0 ? "+" : ""}{tx.amount}
                          </td>
                          <td className="px-4 py-3 text-right" style={{ color: "#211922" }}>
                            {tx.type === "charge" ? `${priceMap[tx.amount] || "-"}원` : "-"}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className="text-xs px-2 py-0.5"
                              style={{
                                borderRadius: 8,
                                background: tx.status === "completed" ? "#103c2514" :
                                  tx.status === "refunded" ? "#e6002314" : "#62625b14",
                                color: tx.status === "completed" ? "#103c25" :
                                  tx.status === "refunded" ? "#e60023" : "#62625b",
                              }}
                            >
                              {tx.status === "completed" ? "완료" :
                                tx.status === "refunded" ? "환불됨" : tx.status}
                            </span>
                          </td>
                          <td className="px-4 py-3" style={{ color: "#91918c" }}>
                            {new Date(tx.created_at).toLocaleDateString("ko-KR")}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {tx.type === "charge" && tx.status === "completed" && (
                              <button
                                onClick={() => handleRefund(tx.id)}
                                disabled={refunding === tx.id}
                                className="text-xs px-3 py-1"
                                style={{
                                  background: "transparent",
                                  color: "#e60023",
                                  border: "1px solid #e60023",
                                  borderRadius: 8,
                                  cursor: refunding === tx.id ? "not-allowed" : "pointer",
                                  opacity: refunding === tx.id ? 0.5 : 1,
                                }}
                              >
                                {refunding === tx.id ? "처리중..." : "환불"}
                              </button>
                            )}
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
        </>
      )}

      {/* Stats Tab */}
      {activeTab === "stats" && (
        <>
          {statsLoading ? (
            <div className="flex items-center justify-center py-20">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="animate-spin" style={{ color: "#e60023" }}>
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.2" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              {/* Daily */}
              <div>
                <h3 className="text-sm font-semibold mb-3" style={{ color: "#211922" }}>
                  일별 매출 (최근 7일)
                </h3>
                <div style={{ border: "1px solid #e5e5e0", borderRadius: 16, overflow: "hidden" }}>
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ background: "#f6f6f3" }}>
                        <th className="text-left px-4 py-3 font-medium" style={{ color: "#62625b" }}>날짜</th>
                        <th className="text-right px-4 py-3 font-medium" style={{ color: "#62625b" }}>건수</th>
                        <th className="text-right px-4 py-3 font-medium" style={{ color: "#62625b" }}>크레딧 합계</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dailyStats.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="text-center py-8" style={{ color: "#62625b" }}>
                            최근 7일간 매출이 없습니다.
                          </td>
                        </tr>
                      ) : (
                        dailyStats.map((s) => (
                          <tr key={s.day} style={{ borderTop: "1px solid #e5e5e0" }}>
                            <td className="px-4 py-3" style={{ color: "#211922" }}>{s.day}</td>
                            <td className="px-4 py-3 text-right" style={{ color: "#62625b" }}>{s.count}건</td>
                            <td className="px-4 py-3 text-right" style={{ color: "#103c25", fontWeight: 500 }}>
                              {s.total.toLocaleString()}C
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Monthly */}
              <div>
                <h3 className="text-sm font-semibold mb-3" style={{ color: "#211922" }}>
                  월별 매출 (최근 3개월)
                </h3>
                <div style={{ border: "1px solid #e5e5e0", borderRadius: 16, overflow: "hidden" }}>
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ background: "#f6f6f3" }}>
                        <th className="text-left px-4 py-3 font-medium" style={{ color: "#62625b" }}>월</th>
                        <th className="text-right px-4 py-3 font-medium" style={{ color: "#62625b" }}>건수</th>
                        <th className="text-right px-4 py-3 font-medium" style={{ color: "#62625b" }}>크레딧 합계</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyStats.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="text-center py-8" style={{ color: "#62625b" }}>
                            최근 3개월간 매출이 없습니다.
                          </td>
                        </tr>
                      ) : (
                        monthlyStats.map((s) => (
                          <tr key={s.month} style={{ borderTop: "1px solid #e5e5e0" }}>
                            <td className="px-4 py-3" style={{ color: "#211922" }}>{s.month}</td>
                            <td className="px-4 py-3 text-right" style={{ color: "#62625b" }}>{s.count}건</td>
                            <td className="px-4 py-3 text-right" style={{ color: "#103c25", fontWeight: 500 }}>
                              {s.total.toLocaleString()}C
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
