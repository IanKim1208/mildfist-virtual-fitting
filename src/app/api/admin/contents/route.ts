import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.is_admin) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const tab = searchParams.get("tab") || "all";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = 20;
    const offset = (page - 1) * limit;

    const db = getDb();

    if (tab === "reports") {
      const countRow = db.prepare(
        "SELECT COUNT(*) as count FROM reports WHERE status = 'pending'"
      ).get() as { count: number };

      const reports = db.prepare(`
        SELECT
          r.id, r.reason, r.status, r.created_at,
          r.style_id,
          u.name as reporter_name, u.email as reporter_email,
          s.image_url as style_image, s.is_hidden as style_hidden,
          su.name as style_owner_name
        FROM reports r
        JOIN users u ON r.user_id = u.id
        JOIN styles s ON r.style_id = s.id
        JOIN users su ON s.user_id = su.id
        WHERE r.status = 'pending'
        ORDER BY r.created_at DESC
        LIMIT ? OFFSET ?
      `).all(limit, offset);

      return Response.json({
        reports,
        total: countRow.count,
        page,
        totalPages: Math.ceil(countRow.count / limit),
      });
    }

    // All contents
    const countRow = db.prepare("SELECT COUNT(*) as count FROM styles").get() as { count: number };

    const contents = db.prepare(`
      SELECT
        s.id, s.image_url, s.likes_count, s.is_hidden, s.created_at,
        u.name as user_name, u.email as user_email
      FROM styles s
      JOIN users u ON s.user_id = u.id
      ORDER BY s.created_at DESC
      LIMIT ? OFFSET ?
    `).all(limit, offset);

    return Response.json({
      contents,
      total: countRow.count,
      page,
      totalPages: Math.ceil(countRow.count / limit),
    });
  } catch (error) {
    console.error("Admin contents error:", error);
    return Response.json({ error: "콘텐츠 조회 중 오류가 발생했습니다." }, { status: 500 });
  }
}
