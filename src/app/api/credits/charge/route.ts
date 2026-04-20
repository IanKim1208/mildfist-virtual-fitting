import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

const PACKAGES: Record<number, { amount: number; price: string }> = {
  10: { amount: 10, price: "1,000" },
  30: { amount: 30, price: "3,000" },
  50: { amount: 50, price: "5,000" },
};

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const { amount } = await request.json();
    const pkg = PACKAGES[amount];
    if (!pkg) {
      return Response.json({ error: "유효하지 않은 충전 패키지입니다." }, { status: 400 });
    }

    const db = getDb();

    db.prepare("UPDATE users SET credits = credits + ? WHERE id = ?").run(pkg.amount, user.id);
    db.prepare(
      "INSERT INTO credit_transactions (user_id, amount, type, description) VALUES (?, ?, ?, ?)"
    ).run(user.id, pkg.amount, "charge", `${pkg.amount}크레딧 충전 (${pkg.price}원)`);

    const updated = db.prepare("SELECT credits FROM users WHERE id = ?").get(user.id) as { credits: number };

    return Response.json({ credits: updated.credits });
  } catch (error) {
    console.error("Charge error:", error);
    return Response.json(
      { error: "크레딧 충전 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
