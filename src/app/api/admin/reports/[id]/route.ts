import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.is_admin) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const reportId = parseInt(id, 10);
    const body = await request.json();
    const db = getDb();

    if (body.action === "hide_content") {
      // Get the style_id from the report
      const report = db.prepare("SELECT style_id FROM reports WHERE id = ?").get(reportId) as { style_id: number } | undefined;
      if (!report) {
        return Response.json({ error: "신고를 찾을 수 없습니다." }, { status: 404 });
      }
      db.prepare("UPDATE styles SET is_hidden = 1 WHERE id = ?").run(report.style_id);
      db.prepare("UPDATE reports SET status = 'resolved' WHERE id = ?").run(reportId);
      return Response.json({ success: true, action: "content_hidden" });
    }

    if (body.action === "dismiss") {
      db.prepare("UPDATE reports SET status = 'dismissed' WHERE id = ?").run(reportId);
      return Response.json({ success: true, action: "dismissed" });
    }

    return Response.json({ error: "유효하지 않은 액션입니다." }, { status: 400 });
  } catch (error) {
    console.error("Admin report update error:", error);
    return Response.json({ error: "신고 처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}
