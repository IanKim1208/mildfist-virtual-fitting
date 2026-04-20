import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.is_admin) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const tab = searchParams.get("tab") || "transactions";

    const db = getDb();

    if (tab === "stats") {
      // Daily stats (last 7 days)
      const dailyStats = db.prepare(`
        SELECT
          date(created_at) as day,
          COUNT(*) as count,
          SUM(amount) as total
        FROM credit_transactions
        WHERE type = 'charge' AND status = 'completed'
          AND created_at >= datetime('now', '-7 days')
        GROUP BY date(created_at)
        ORDER BY day DESC
      `).all();

      // Monthly stats (last 3 months)
      const monthlyStats = db.prepare(`
        SELECT
          strftime('%Y-%m', created_at) as month,
          COUNT(*) as count,
          SUM(amount) as total
        FROM credit_transactions
        WHERE type = 'charge' AND status = 'completed'
          AND created_at >= datetime('now', '-3 months')
        GROUP BY strftime('%Y-%m', created_at)
        ORDER BY month DESC
      `).all();

      return Response.json({ dailyStats, monthlyStats });
    }

    // Transactions
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = 20;
    const offset = (page - 1) * limit;

    const countRow = db.prepare(
      "SELECT COUNT(*) as count FROM credit_transactions WHERE type IN ('charge', 'refund')"
    ).get() as { count: number };

    const transactions = db.prepare(`
      SELECT
        ct.id, ct.amount, ct.type, ct.description, ct.status, ct.created_at,
        u.name as user_name, u.email as user_email
      FROM credit_transactions ct
      JOIN users u ON ct.user_id = u.id
      WHERE ct.type IN ('charge', 'refund')
      ORDER BY ct.created_at DESC
      LIMIT ? OFFSET ?
    `).all(limit, offset);

    return Response.json({
      transactions,
      total: countRow.count,
      page,
      totalPages: Math.ceil(countRow.count / limit),
    });
  } catch (error) {
    console.error("Admin payments error:", error);
    return Response.json({ error: "결제 조회 중 오류가 발생했습니다." }, { status: 500 });
  }
}
