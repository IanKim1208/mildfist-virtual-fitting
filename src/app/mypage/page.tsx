"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";

interface StyleItem {
  id: number;
  image_url: string;
  likes_count: number;
  created_at: string;
}

interface FittingItem {
  id: number;
  my_image: string | null;
  style_image: string | null;
  result_image: string | null;
  selected_items: string;
  created_at: string;
}

interface CreditTransaction {
  id: number;
  amount: number;
  type: string;
  description: string;
  created_at: string;
}

type Tab = "styles" | "fittings" | "credits";

const CHARGE_PACKAGES = [
  { amount: 10, price: "1,000" },
  { amount: 30, price: "3,000" },
  { amount: 50, price: "5,000" },
];

export default function MyPage() {
  const { user, logout, refresh } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("styles");
  const [myStyles, setMyStyles] = useState<StyleItem[]>([]);
  const [fittings, setFittings] = useState<FittingItem[]>([]);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [charging, setCharging] = useState(false);
  const [withdrawConfirm, setWithdrawConfirm] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === "styles") {
        const res = await fetch("/api/styles?sort=latest&page=1");
        const data = await res.json();
        setMyStyles(
          (data.styles || []).filter((s: { user_id: number }) => s.user_id === user?.id)
        );
      } else if (activeTab === "fittings") {
        const res = await fetch("/api/fittings");
        const data = await res.json();
        setFittings(data.fittings || []);
      } else if (activeTab === "credits") {
        const res = await fetch("/api/credits");
        const data = await res.json();
        setCredits(data.credits || 0);
        setTransactions(data.transactions || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [activeTab, user?.id]);

  useEffect(() => {
    if (user) fetchData();
  }, [user, fetchData]);

  const handleCharge = async (amount: number) => {
    setCharging(true);
    try {
      const res = await fetch("/api/credits/charge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      if (res.ok) {
        const data = await res.json();
        setCredits(data.credits);
        refresh();
        // Refresh transactions
        const txRes = await fetch("/api/credits");
        const txData = await txRes.json();
        setTransactions(txData.transactions || []);
      }
    } catch {
      // ignore
    } finally {
      setCharging(false);
    }
  };

  const handleWithdraw = async () => {
    try {
      const res = await fetch("/api/auth/withdraw", { method: "POST" });
      if (res.ok) {
        await logout();
        router.push("/");
      }
    } catch {
      // ignore
    }
  };

  if (!user) return null;

  const tabs: { key: Tab; label: string }[] = [
    { key: "styles", label: "내 스타일" },
    { key: "fittings", label: "피팅 히스토리" },
    { key: "credits", label: "크레딧" },
  ];

  return (
    <div className="flex-1" style={{ background: "#ffffff" }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Profile section */}
        <div className="flex items-center gap-4 mb-8">
          <div
            className="flex items-center justify-center text-xl font-semibold"
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "#e5e5e0",
              color: "#211922",
            }}
          >
            {user.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-lg font-semibold" style={{ color: "#211922" }}>
              {user.name}
            </h1>
            <p className="text-sm" style={{ color: "#62625b" }}>{user.email}</p>
            <div className="flex items-center gap-1 mt-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#e60023" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              <span className="text-xs font-medium" style={{ color: "#e60023" }}>
                {user.credits} 크레딧
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <nav className="flex gap-6 mb-6" style={{ borderBottom: "1px solid #e5e5e0" }}>
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
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

        {/* Tab content */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="animate-spin" style={{ color: "#e60023" }}>
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.2" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
        ) : (
          <>
            {/* My Styles */}
            {activeTab === "styles" && (
              <div>
                {myStyles.length === 0 ? (
                  <div className="flex flex-col items-center py-16 gap-3">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#91918c" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" />
                    </svg>
                    <p className="text-sm" style={{ color: "#62625b" }}>아직 업로드한 스타일이 없습니다.</p>
                    <Link href="/" className="text-xs font-medium no-underline" style={{ color: "#e60023" }}>
                      스타일 올리러 가기
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {myStyles.map((s) => (
                      <Link
                        key={s.id}
                        href={`/style/${s.id}`}
                        className="block no-underline"
                      >
                        <div className="overflow-hidden" style={{ borderRadius: 16, background: "#f6f6f3" }}>
                          <img src={s.image_url} alt="Style" className="w-full object-cover" style={{ minHeight: 140 }} />
                        </div>
                        <div className="flex items-center gap-1 mt-1.5 px-1">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="#e60023" stroke="#e60023" strokeWidth="2">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                          </svg>
                          <span className="text-xs" style={{ color: "#91918c" }}>{s.likes_count}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Fitting History */}
            {activeTab === "fittings" && (
              <div>
                {fittings.length === 0 ? (
                  <div className="flex flex-col items-center py-16 gap-3">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#91918c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 3v12" /><path d="M18 9a3 3 0 0 1-3 3H6" />
                    </svg>
                    <p className="text-sm" style={{ color: "#62625b" }}>아직 피팅 기록이 없습니다.</p>
                    <Link href="/fitting" className="text-xs font-medium no-underline" style={{ color: "#e60023" }}>
                      가상 피팅 해보기
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {fittings.map((f) => (
                      <div
                        key={f.id}
                        className="flex gap-4 p-4"
                        style={{ background: "#f6f6f3", borderRadius: 16 }}
                      >
                        <div className="flex gap-2 shrink-0">
                          {f.result_image && (
                            <img
                              src={f.result_image}
                              alt="Fitting result"
                              className="object-cover"
                              style={{ width: 80, height: 80, borderRadius: 12 }}
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium" style={{ color: "#211922" }}>
                            가상 피팅
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: "#62625b" }}>
                            {(() => {
                              try {
                                return JSON.parse(f.selected_items).join(", ");
                              } catch {
                                return "";
                              }
                            })()}
                          </p>
                          <p className="text-xs mt-1" style={{ color: "#91918c" }}>
                            {new Date(f.created_at).toLocaleDateString("ko-KR")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Credits */}
            {activeTab === "credits" && (
              <div className="flex flex-col gap-6">
                {/* Balance */}
                <div
                  className="flex items-center justify-between p-6"
                  style={{ background: "#f6f6f3", borderRadius: 20 }}
                >
                  <div>
                    <p className="text-xs" style={{ color: "#62625b" }}>보유 크레딧</p>
                    <p className="text-2xl font-semibold mt-1" style={{ color: "#211922" }}>
                      {credits}
                      <span className="text-sm font-normal ml-1" style={{ color: "#62625b" }}>크레딧</span>
                    </p>
                  </div>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#e60023" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                </div>

                {/* Charge packages */}
                <div>
                  <h3 className="text-sm font-semibold mb-3" style={{ color: "#211922" }}>크레딧 충전</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {CHARGE_PACKAGES.map((pkg) => (
                      <button
                        key={pkg.amount}
                        onClick={() => handleCharge(pkg.amount)}
                        disabled={charging}
                        className="flex flex-col items-center gap-1 p-4 transition-colors"
                        style={{
                          background: "#ffffff",
                          border: "1px solid #e5e5e0",
                          borderRadius: 16,
                          cursor: charging ? "not-allowed" : "pointer",
                        }}
                        onMouseEnter={(e) => { if (!charging) e.currentTarget.style.borderColor = "#e60023"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e5e5e0"; }}
                      >
                        <span className="text-lg font-semibold" style={{ color: "#211922" }}>
                          {pkg.amount}
                        </span>
                        <span className="text-xs" style={{ color: "#62625b" }}>크레딧</span>
                        <span className="text-xs font-medium mt-1" style={{ color: "#e60023" }}>
                          {pkg.price}원
                        </span>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs mt-2" style={{ color: "#91918c" }}>
                    프로토타입 데모 — 실제 결제는 이루어지지 않습니다.
                  </p>
                </div>

                {/* Transaction history */}
                {transactions.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-3" style={{ color: "#211922" }}>이용 내역</h3>
                    <div className="flex flex-col gap-2">
                      {transactions.map((tx) => (
                        <div
                          key={tx.id}
                          className="flex items-center justify-between p-3"
                          style={{ background: "#f6f6f3", borderRadius: 12 }}
                        >
                          <div>
                            <p className="text-sm" style={{ color: "#211922" }}>{tx.description}</p>
                            <p className="text-xs mt-0.5" style={{ color: "#91918c" }}>
                              {new Date(tx.created_at).toLocaleDateString("ko-KR")}
                            </p>
                          </div>
                          <span
                            className="text-sm font-medium"
                            style={{ color: tx.amount > 0 ? "#103c25" : "#e60023" }}
                          >
                            {tx.amount > 0 ? "+" : ""}{tx.amount}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Withdraw */}
        <div className="mt-12 pt-6" style={{ borderTop: "1px solid #e5e5e0" }}>
          {!withdrawConfirm ? (
            <button
              onClick={() => setWithdrawConfirm(true)}
              className="text-xs"
              style={{ color: "#91918c", background: "none", border: "none", cursor: "pointer" }}
            >
              회원 탈퇴
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <p className="text-xs" style={{ color: "#e60023" }}>
                정말 탈퇴하시겠습니까? 모든 데이터가 삭제됩니다.
              </p>
              <button
                onClick={handleWithdraw}
                className="text-xs font-medium"
                style={{
                  background: "#e60023",
                  color: "#ffffff",
                  borderRadius: 12,
                  padding: "6px 14px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                탈퇴하기
              </button>
              <button
                onClick={() => setWithdrawConfirm(false)}
                className="text-xs font-medium"
                style={{
                  background: "#e5e5e0",
                  color: "#211922",
                  borderRadius: 12,
                  padding: "6px 14px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                취소
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
