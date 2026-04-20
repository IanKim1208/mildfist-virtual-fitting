"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "./AuthContext";

export default function Header() {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header
      className="sticky top-0 z-50 flex items-center justify-between px-4 sm:px-6 py-3"
      style={{
        background: "#ffffff",
        borderBottom: "1px solid #e5e5e0",
      }}
    >
      {/* Left: Logo */}
      <Link href="/" className="flex items-center gap-2 no-underline shrink-0">
        <div
          className="flex items-center justify-center"
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            background: "#e60023",
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 3v12" />
            <path d="M18 9a3 3 0 0 1-3 3H6" />
            <path d="m10 8 -4 4 4 4" />
          </svg>
        </div>
        <span
          className="text-lg font-semibold tracking-tight hidden sm:inline"
          style={{ color: "#211922" }}
        >
          MildFist
        </span>
      </Link>

      {/* Center: Search placeholder */}
      <div className="flex-1 max-w-md mx-4 hidden sm:block">
        <div
          className="flex items-center gap-2 px-4 py-2"
          style={{
            background: "#f6f6f3",
            borderRadius: 20,
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#91918c"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="스타일 검색..."
            className="flex-1 text-sm bg-transparent outline-none"
            style={{ color: "#211922" }}
            readOnly
          />
        </div>
      </div>

      {/* Right: Auth area */}
      <div className="flex items-center gap-3 shrink-0">
        {user ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2"
              style={{ background: "none", border: "none", cursor: "pointer" }}
            >
              <div
                className="flex items-center justify-center text-xs font-semibold"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "#e5e5e0",
                  color: "#211922",
                }}
              >
                {user.name.charAt(0)}
              </div>
              <span
                className="text-sm font-medium hidden sm:inline"
                style={{ color: "#211922" }}
              >
                {user.name}
              </span>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#91918c"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {dropdownOpen && (
              <div
                className="absolute right-0 mt-2 py-2"
                style={{
                  background: "#ffffff",
                  borderRadius: 16,
                  border: "1px solid #e5e5e0",
                  minWidth: 180,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }}
              >
                <Link
                  href="/mypage"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm no-underline transition-colors"
                  style={{ color: "#211922" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f6f6f3")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  마이페이지
                </Link>
                <Link
                  href="/analyze"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm no-underline transition-colors"
                  style={{ color: "#211922" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f6f6f3")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  아이템 인식
                </Link>
                <Link
                  href="/fitting"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm no-underline transition-colors"
                  style={{ color: "#211922" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f6f6f3")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 3v12" />
                    <path d="M18 9a3 3 0 0 1-3 3H6" />
                  </svg>
                  가상 피팅
                </Link>
                {user.is_admin === 1 && (
                  <Link
                    href="/admin"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm no-underline transition-colors"
                    style={{ color: "#211922" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f6f6f3")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="7" height="7" />
                      <rect x="14" y="3" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" />
                    </svg>
                    관리자
                  </Link>
                )}
                <div style={{ borderTop: "1px solid #e5e5e0", margin: "4px 0" }} />
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                  }}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm transition-colors"
                  style={{ color: "#e60023", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f6f6f3")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  로그아웃
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/login"
            className="flex items-center text-sm font-medium no-underline"
            style={{
              background: "#e60023",
              color: "#ffffff",
              borderRadius: 16,
              padding: "8px 20px",
            }}
          >
            로그인
          </Link>
        )}
      </div>
    </header>
  );
}
