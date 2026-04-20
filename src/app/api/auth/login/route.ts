import { getDb } from "@/lib/db";
import { hashPassword, setSessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return Response.json(
        { error: "이메일과 비밀번호를 입력해주세요." },
        { status: 400 }
      );
    }

    const db = getDb();
    const user = db
      .prepare("SELECT * FROM users WHERE email = ?")
      .get(email) as { id: number; password_hash: string; email: string; name: string; profile_image: string | null; credits: number; created_at: string } | undefined;

    if (!user || user.password_hash !== hashPassword(password)) {
      return Response.json(
        { error: "이메일 또는 비밀번호가 올바르지 않습니다." },
        { status: 401 }
      );
    }

    await setSessionCookie(user.id);

    return Response.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        profile_image: user.profile_image,
        credits: user.credits,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    const errStack = error instanceof Error ? error.stack : "";
    console.error("Login error:", errMsg, errStack);
    return Response.json(
      { error: "로그인 중 오류가 발생했습니다.", debug: errMsg },
      { status: 500 }
    );
  }
}
