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
    const styleId = parseInt(id, 10);
    const body = await request.json();
    const db = getDb();

    if (body.action === "hide") {
      db.prepare("UPDATE styles SET is_hidden = 1 WHERE id = ?").run(styleId);
      return Response.json({ success: true, action: "hidden" });
    }

    if (body.action === "unhide") {
      db.prepare("UPDATE styles SET is_hidden = 0 WHERE id = ?").run(styleId);
      return Response.json({ success: true, action: "unhidden" });
    }

    if (body.action === "delete") {
      db.prepare("DELETE FROM styles WHERE id = ?").run(styleId);
      return Response.json({ success: true, action: "deleted" });
    }

    return Response.json({ error: "유효하지 않은 액션입니다." }, { status: 400 });
  } catch (error) {
    console.error("Admin content update error:", error);
    return Response.json({ error: "콘텐츠 상태 변경 중 오류가 발생했습니다." }, { status: 500 });
  }
}
