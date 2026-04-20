"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthContext";

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="animate-spin" style={{ color: "#e60023" }}>
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.2" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>
    }>
      <LoginPageInner />
    </Suspense>
  );
}

function LoginPageInner() {
  const { login, signup } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "login") {
        const result = await login(email, password);
        if (result.ok) {
          router.push(redirectTo);
        } else {
          setError(result.error || "로그인에 실패했습니다.");
        }
      } else {
        if (!name.trim()) {
          setError("이름을 입력해주세요.");
          setLoading(false);
          return;
        }
        const result = await signup(email, password, name);
        if (result.ok) {
          router.push(redirectTo);
        } else {
          setError(result.error || "회원가입에 실패했습니다.");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex-1 flex items-center justify-center px-4 py-12"
      style={{ background: "#ffffff" }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="flex items-center justify-center mb-3"
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: "#e60023",
            }}
          >
            <svg
              width="22"
              height="22"
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
          <h1 className="text-xl font-semibold" style={{ color: "#211922" }}>
            MildFist
          </h1>
          <p className="mt-1 text-sm" style={{ color: "#62625b" }}>
            {mode === "login" ? "로그인하여 시작하세요" : "새 계정을 만드세요"}
          </p>
        </div>

        {/* Mode toggle */}
        <div
          className="flex mb-6"
          style={{ background: "#f6f6f3", borderRadius: 16, padding: 4 }}
        >
          {(["login", "signup"] as const).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                setError("");
              }}
              className="flex-1 text-sm font-medium py-2 transition-colors"
              style={{
                background: mode === m ? "#ffffff" : "transparent",
                color: mode === m ? "#211922" : "#91918c",
                borderRadius: 12,
                border: "none",
                cursor: "pointer",
              }}
            >
              {m === "login" ? "로그인" : "회원가입"}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === "signup" && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: "#211922" }}>
                이름
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="홍길동"
                className="text-sm outline-none"
                style={{
                  border: "1px solid #91918c",
                  borderRadius: 16,
                  padding: "10px 16px",
                  color: "#211922",
                  background: "#ffffff",
                }}
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium" style={{ color: "#211922" }}>
              이메일
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              className="text-sm outline-none"
              style={{
                border: "1px solid #91918c",
                borderRadius: 16,
                padding: "10px 16px",
                color: "#211922",
                background: "#ffffff",
              }}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium" style={{ color: "#211922" }}>
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === "signup" ? "4자 이상" : "비밀번호 입력"}
              className="text-sm outline-none"
              style={{
                border: "1px solid #91918c",
                borderRadius: 16,
                padding: "10px 16px",
                color: "#211922",
                background: "#ffffff",
              }}
              required
            />
          </div>

          {error && (
            <p className="text-sm" style={{ color: "#e60023" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 text-sm font-medium mt-2"
            style={{
              background: loading ? "#e5e5e0" : "#e60023",
              color: loading ? "#91918c" : "#ffffff",
              borderRadius: 16,
              padding: "12px 20px",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? (
              <>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="animate-spin"
                >
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.3" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
                처리 중...
              </>
            ) : mode === "login" ? (
              "로그인"
            ) : (
              "회원가입"
            )}
          </button>
        </form>

        {/* Demo accounts */}
        <div
          className="mt-6 p-4"
          style={{ background: "#f6f6f3", borderRadius: 16 }}
        >
          <p className="text-xs font-medium mb-2" style={{ color: "#211922" }}>
            데모 계정
          </p>
          <div className="flex flex-col gap-1.5 text-xs" style={{ color: "#62625b" }}>
            <p>demo@mildfist.com / demo1234</p>
            <p>fashion@mildfist.com / fashion1234</p>
            <p>test@mildfist.com / test1234</p>
          </div>
        </div>

        {/* Terms link */}
        <p className="mt-4 text-center text-xs" style={{ color: "#91918c" }}>
          가입 시{" "}
          <Link href="/terms" style={{ color: "#62625b", textDecoration: "underline" }}>
            이용약관
          </Link>
          에 동의하게 됩니다.
        </p>
      </div>
    </div>
  );
}
