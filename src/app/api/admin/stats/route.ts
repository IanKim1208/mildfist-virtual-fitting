import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || !user.is_admin) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const db = getDb();

    // Total users
    const totalUsers = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };

    // Today's active users (approximate: users who created styles or fittings today)
    const todayActive = db.prepare(`
      SELECT COUNT(DISTINCT user_id) as count FROM (
        SELECT user_id FROM styles WHERE date(created_at) = date('now')
        UNION
        SELECT user_id FROM fittings WHERE date(created_at) = date('now')
      )
    `).get() as { count: number };

    // Credit charge stats
    const chargeStats = db.prepare(`
      SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total
      FROM credit_transactions
      WHERE type = 'charge' AND status = 'completed'
    `).get() as { count: number; total: number };

    // Total fittings
    const totalFittings = db.prepare("SELECT COUNT(*) as count FROM fittings").get() as { count: number };

    // Recent activity (last 10 events)
    const recentActivity = db.prepare(`
      SELECT * FROM (
        SELECT 'signup' as event_type, u.name as user_name, u.email as detail, u.created_at
        FROM users u
        UNION ALL
        SELECT 'style' as event_type, u.name as user_name, '스타일 업로드' as detail, s.created_at
        FROM styles s JOIN users u ON s.user_id = u.id
        UNION ALL
        SELECT 'fitting' as event_type, u.name as user_name, '가상 피팅' as detail, f.created_at
        FROM fittings f JOIN users u ON f.user_id = u.id
        UNION ALL
        SELECT 'charge' as event_type, u.name as user_name, ct.description as detail, ct.created_at
        FROM credit_transactions ct JOIN users u ON ct.user_id = u.id WHERE ct.type = 'charge'
      )
      ORDER BY created_at DESC
      LIMIT 10
    `).all();

    return Response.json({
      stats: {
        totalUsers: totalUsers.count,
        todayActive: todayActive.count,
        chargeCount: chargeStats.count,
        chargeTotal: chargeStats.total,
        totalFittings: totalFittings.count,
      },
      recentActivity,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return Response.json({ error: "통계 조회 중 오류가 발생했습니다." }, { status: 500 });
  }
}
