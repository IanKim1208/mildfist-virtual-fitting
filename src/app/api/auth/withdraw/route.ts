import { getCurrentUser, clearSessionCookie } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const db = getDb();
    db.prepare("DELETE FROM users WHERE id = ?").run(user.id);

    await clearSessionCookie();

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Withdraw error:", error);
    return Response.json(
      { error: "회원 탈퇴 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
