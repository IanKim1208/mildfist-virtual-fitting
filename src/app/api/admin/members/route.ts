import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.is_admin) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = 20;
    const offset = (page - 1) * limit;

    const db = getDb();

    let where = "";
    const params: (string | number)[] = [];

    if (search) {
      where = "WHERE u.name LIKE ? OR u.email LIKE ?";
      params.push(`%${search}%`, `%${search}%`);
    }

    const countRow = db.prepare(
      `SELECT COUNT(*) as count FROM users u ${where}`
    ).get(...params) as { count: number };

    const members = db.prepare(`
      SELECT
        u.id, u.email, u.name, u.credits, u.is_active, u.is_admin, u.created_at,
        (SELECT COUNT(*) FROM styles WHERE user_id = u.id) as style_count,
        (SELECT COUNT(*) FROM fittings WHERE user_id = u.id) as fitting_count
      FROM users u
      ${where}
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset);

    return Response.json({
      members,
      total: countRow.count,
      page,
      totalPages: Math.ceil(countRow.count / limit),
    });
  } catch (error) {
    console.error("Admin members error:", error);
    return Response.json({ error: "회원 조회 중 오류가 발생했습니다." }, { status: 500 });
  }
}
