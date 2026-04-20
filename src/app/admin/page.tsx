"use client";

import { useState, useEffect } from "react";

interface Stats {
  totalUsers: number;
  todayActive: number;
  chargeCount: number;
  chargeTotal: number;
  totalFittings: number;
}

interface Activity {
  event_type: string;
  user_name: string;
  detail: string;
  created_at: string;
}

const EVENT_LABELS: Record<string, { label: string; color: string }> = {
  signup: { label: "가입", color: "#103c25" },
  style: { label: "스타일", color: "#6845ab" },
  fitting: { label: "피팅", color: "#2b48d4" },
  charge: { label: "충전", color: "#e60023" },
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
          setActivity(data.recentActivity || []);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="animate-spin" style={{ color: "#e60023" }}>
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.2" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  const statCards = [
    {
      label: "총 가입자 수",
      value: stats?.totalUsers ?? 0,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e60023" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      label: "오늘 활성 사용자",
      value: stats?.todayActive ?? 0,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e60023" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      ),
    },
    {
      label: "크레딧 충전",
      value: `${stats?.chargeCount ?? 0}건 / ${(stats?.chargeTotal ?? 0).toLocaleString()}C`,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e60023" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      ),
    },
    {
      label: "피팅 이용 건수",
      value: stats?.totalFittings ?? 0,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e60023" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 3v12" />
          <path d="M18 9a3 3 0 0 1-3 3H6" />
        </svg>
      ),
    },
  ];

  return (
    <div className="p-6 sm:p-8 max-w-5xl">
      <h1 className="text-xl font-semibold mb-6" style={{ color: "#211922" }}>
        대시보드
      </h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, i) => (
          <div
            key={i}
            className="p-5"
            style={{
              background: "#ffffff",
              border: "1px solid #e5e5e0",
              borderRadius: 16,
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs" style={{ color: "#62625b" }}>
                {card.label}
              </span>
              {card.icon}
            </div>
            <p className="text-2xl font-semibold" style={{ color: "#211922", fontSize: 28 }}>
              {typeof card.value === "number" ? card.value.toLocaleString() : card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-sm font-semibold mb-4" style={{ color: "#211922" }}>
          최근 활동
        </h2>
        <div
          className="overflow-hidden"
          style={{ border: "1px solid #e5e5e0", borderRadius: 16 }}
        >
          {activity.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm" style={{ color: "#62625b" }}>활동 내역이 없습니다.</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "#e5e5e0" }}>
              {activity.map((a, i) => {
                const ev = EVENT_LABELS[a.event_type] || { label: a.event_type, color: "#62625b" };
                return (
                  <div key={i} className="flex items-center gap-3 px-5 py-3.5">
                    <span
                      className="text-xs font-medium px-2 py-0.5 shrink-0"
                      style={{
                        background: ev.color + "14",
                        color: ev.color,
                        borderRadius: 8,
                      }}
                    >
                      {ev.label}
                    </span>
                    <span className="text-sm flex-1 min-w-0 truncate" style={{ color: "#211922" }}>
                      <strong>{a.user_name}</strong>
                      <span style={{ color: "#62625b" }}> &middot; {a.detail}</span>
                    </span>
                    <span className="text-xs shrink-0" style={{ color: "#91918c" }}>
                      {new Date(a.created_at).toLocaleDateString("ko-KR", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
