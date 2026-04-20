import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const { amount, description } = await request.json();
    const useAmount = amount || 1;

    if (user.credits < useAmount) {
      return Response.json(
        { error: "크레딧이 부족합니다. 충전 후 이용해주세요." },
        { status: 400 }
      );
    }

    const db = getDb();

    db.prepare("UPDATE users SET credits = credits - ? WHERE id = ?").run(useAmount, user.id);
    db.prepare(
      "INSERT INTO credit_transactions (user_id, amount, type, description) VALUES (?, ?, ?, ?)"
    ).run(user.id, -useAmount, "use", description || "크레딧 사용");

    const updated = db.prepare("SELECT credits FROM users WHERE id = ?").get(user.id) as { credits: number };

    return Response.json({ credits: updated.credits });
  } catch (error) {
    console.error("Use credits error:", error);
    return Response.json(
      { error: "크레딧 사용 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
