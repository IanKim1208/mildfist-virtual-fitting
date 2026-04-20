import { getDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const { id } = await params;
    const styleId = parseInt(id, 10);
    const { reason } = await request.json();

    if (!reason) {
      return Response.json({ error: "신고 사유를 선택해주세요." }, { status: 400 });
    }

    const db = getDb();

    // Check if style exists
    const style = db.prepare("SELECT id FROM styles WHERE id = ?").get(styleId);
    if (!style) {
      return Response.json({ error: "스타일을 찾을 수 없습니다." }, { status: 404 });
    }

    db.prepare("INSERT INTO reports (user_id, style_id, reason) VALUES (?, ?, ?)").run(
      user.id,
      styleId,
      reason
    );

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Report error:", error);
    return Response.json(
      { error: "신고 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
