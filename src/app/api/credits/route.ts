import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const db = getDb();
    const transactions = db
      .prepare(
        "SELECT * FROM credit_transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 50"
      )
      .all(user.id);

    return Response.json({ credits: user.credits, transactions });
  } catch (error) {
    console.error("Credits error:", error);
    return Response.json(
      { error: "크레딧 정보를 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
