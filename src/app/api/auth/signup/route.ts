import { getDb } from "@/lib/db";
import { hashPassword, setSessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return Response.json(
        { error: "이메일, 비밀번호, 이름을 모두 입력해주세요." },
        { status: 400 }
      );
    }

    if (password.length < 4) {
      return Response.json(
        { error: "비밀번호는 4자 이상이어야 합니다." },
        { status: 400 }
      );
    }

    const db = getDb();

    // Check duplicate
    const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
    if (existing) {
      return Response.json(
        { error: "이미 등록된 이메일입니다." },
        { status: 409 }
      );
    }

    const result = db
      .prepare("INSERT INTO users (email, password_hash, name, credits) VALUES (?, ?, ?, ?)")
      .run(email, hashPassword(password), name, 10); // 10 free credits on signup

    const userId = result.lastInsertRowid as number;

    // Record the signup bonus
    db.prepare(
      "INSERT INTO credit_transactions (user_id, amount, type, description) VALUES (?, ?, ?, ?)"
    ).run(userId, 10, "bonus", "회원가입 보너스");

    await setSessionCookie(userId);

    const user = db
      .prepare("SELECT id, email, name, profile_image, credits, created_at FROM users WHERE id = ?")
      .get(userId);

    return Response.json({ user });
  } catch (error) {
    console.error("Signup error:", error);
    return Response.json(
      { error: "회원가입 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
