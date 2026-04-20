import { getDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const { id } = await params;
    const styleId = parseInt(id, 10);
    const db = getDb();

    // Check if style exists
    const style = db.prepare("SELECT id FROM styles WHERE id = ?").get(styleId);
    if (!style) {
      return Response.json({ error: "스타일을 찾을 수 없습니다." }, { status: 404 });
    }

    // Toggle like
    const existingLike = db
      .prepare("SELECT id FROM likes WHERE user_id = ? AND style_id = ?")
      .get(user.id, styleId);

    if (existingLike) {
      // Unlike
      db.prepare("DELETE FROM likes WHERE user_id = ? AND style_id = ?").run(user.id, styleId);
      db.prepare("UPDATE styles SET likes_count = MAX(0, likes_count - 1) WHERE id = ?").run(styleId);
    } else {
      // Like
      db.prepare("INSERT INTO likes (user_id, style_id) VALUES (?, ?)").run(user.id, styleId);
      db.prepare("UPDATE styles SET likes_count = likes_count + 1 WHERE id = ?").run(styleId);
    }

    const updated = db.prepare("SELECT likes_count FROM styles WHERE id = ?").get(styleId) as { likes_count: number };
    const liked = !existingLike;

    return Response.json({ liked, likes_count: updated.likes_count });
  } catch (error) {
    console.error("Like error:", error);
    return Response.json(
      { error: "좋아요 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
