import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.is_admin) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const section = searchParams.get("section") || "transactions";

    const db = getDb();

    if (section === "packages") {
      // Return static package info for prototype
      return Response.json({
        packages: [
          { id: 1, credits: 10, price: 1000, label: "10크레딧" },
          { id: 2, credits: 30, price: 3000, label: "30크레딧" },
          { id: 3, credits: 50, price: 5000, label: "50크레딧" },
        ],
      });
    }

    // Charge transactions
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = 20;
    const offset = (page - 1) * limit;

    const countRow = db.prepare(
      "SELECT COUNT(*) as count FROM credit_transactions WHERE type = 'charge'"
    ).get() as { count: number };

    const transactions = db.prepare(`
      SELECT
        ct.id, ct.amount, ct.type, ct.description, ct.status, ct.created_at,
        u.name as user_name, u.email as user_email
      FROM credit_transactions ct
      JOIN users u ON ct.user_id = u.id
      WHERE ct.type = 'charge'
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
    console.error("Admin credits error:", error);
    return Response.json({ error: "크레딧 조회 중 오류가 발생했습니다." }, { status: 500 });
  }
}
