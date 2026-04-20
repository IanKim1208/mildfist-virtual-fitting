import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.is_admin) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const { userId, amount, reason } = await request.json();

    if (!userId || !amount || !reason) {
      return Response.json({ error: "필수 항목을 입력해 주세요." }, { status: 400 });
    }

    const creditAmount = parseInt(amount, 10);
    if (isNaN(creditAmount) || creditAmount === 0) {
      return Response.json({ error: "유효한 크레딧 수량을 입력해 주세요." }, { status: 400 });
    }

    const db = getDb();

    // Check target user exists
    const targetUser = db.prepare("SELECT id, name, credits FROM users WHERE id = ?").get(userId) as {
      id: number;
      name: string;
      credits: number;
    } | undefined;

    if (!targetUser) {
      return Response.json({ error: "사용자를 찾을 수 없습니다." }, { status: 404 });
    }

    // Prevent negative balance
    if (targetUser.credits + creditAmount < 0) {
      return Response.json({ error: "크레딧 잔액이 부족합니다." }, { status: 400 });
    }

    db.prepare("UPDATE users SET credits = credits + ? WHERE id = ?").run(creditAmount, userId);

    const type = creditAmount > 0 ? "admin_grant" : "admin_deduct";
    const description = creditAmount > 0
      ? `관리자 지급: ${reason} (+${creditAmount})`
      : `관리자 회수: ${reason} (${creditAmount})`;

    db.prepare(
      "INSERT INTO credit_transactions (user_id, amount, type, description, status) VALUES (?, ?, ?, ?, 'completed')"
    ).run(userId, creditAmount, type, description);

    const updated = db.prepare("SELECT credits FROM users WHERE id = ?").get(userId) as { credits: number };

    return Response.json({
      success: true,
      userName: targetUser.name,
      newBalance: updated.credits,
      adjustment: creditAmount,
    });
  } catch (error) {
    console.error("Admin manual credit error:", error);
    return Response.json({ error: "크레딧 지급/회수 중 오류가 발생했습니다." }, { status: 500 });
  }
}
