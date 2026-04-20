import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.is_admin) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const transactionId = parseInt(id, 10);
    const db = getDb();

    // Get the original transaction
    const transaction = db.prepare(
      "SELECT id, user_id, amount, type, status FROM credit_transactions WHERE id = ?"
    ).get(transactionId) as {
      id: number;
      user_id: number;
      amount: number;
      type: string;
      status: string;
    } | undefined;

    if (!transaction) {
      return Response.json({ error: "거래를 찾을 수 없습니다." }, { status: 404 });
    }

    if (transaction.status === "refunded") {
      return Response.json({ error: "이미 환불된 거래입니다." }, { status: 400 });
    }

    if (transaction.type !== "charge") {
      return Response.json({ error: "충전 거래만 환불 가능합니다." }, { status: 400 });
    }

    // Check if user has enough credits
    const targetUser = db.prepare("SELECT credits FROM users WHERE id = ?").get(transaction.user_id) as { credits: number };
    if (targetUser.credits < transaction.amount) {
      return Response.json({ error: "사용자 크레딧 잔액이 부족하여 환불할 수 없습니다." }, { status: 400 });
    }

    // Process refund
    db.prepare("UPDATE users SET credits = credits - ? WHERE id = ?").run(transaction.amount, transaction.user_id);
    db.prepare("UPDATE credit_transactions SET status = 'refunded' WHERE id = ?").run(transactionId);
    db.prepare(
      "INSERT INTO credit_transactions (user_id, amount, type, description, status) VALUES (?, ?, 'refund', ?, 'completed')"
    ).run(transaction.user_id, -transaction.amount, `환불 처리 (거래 #${transactionId})`);

    return Response.json({ success: true });
  } catch (error) {
    console.error("Admin refund error:", error);
    return Response.json({ error: "환불 처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}
