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
    const memberId = parseInt(id, 10);
    const body = await request.json();
    const db = getDb();

    if (typeof body.is_active === "number") {
      db.prepare("UPDATE users SET is_active = ? WHERE id = ?").run(body.is_active, memberId);
    }

    const updated = db.prepare(
      "SELECT id, email, name, credits, is_active, is_admin, created_at FROM users WHERE id = ?"
    ).get(memberId);

    return Response.json({ member: updated });
  } catch (error) {
    console.error("Admin member update error:", error);
    return Response.json({ error: "회원 상태 변경 중 오류가 발생했습니다." }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.is_admin) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const memberId = parseInt(id, 10);
    const db = getDb();

    const member = db.prepare(
      "SELECT id, email, name, profile_image, credits, is_active, is_admin, created_at FROM users WHERE id = ?"
    ).get(memberId);

    if (!member) {
      return Response.json({ error: "회원을 찾을 수 없습니다." }, { status: 404 });
    }

    const styles = db.prepare(
      "SELECT id, image_url, likes_count, is_hidden, created_at FROM styles WHERE user_id = ? ORDER BY created_at DESC"
    ).all(memberId);

    const fittings = db.prepare(
      "SELECT id, result_image, selected_items, created_at FROM fittings WHERE user_id = ? ORDER BY created_at DESC LIMIT 10"
    ).all(memberId);

    const creditHistory = db.prepare(
      "SELECT id, amount, type, description, status, created_at FROM credit_transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 20"
    ).all(memberId);

    return Response.json({ member, styles, fittings, creditHistory });
  } catch (error) {
    console.error("Admin member detail error:", error);
    return Response.json({ error: "회원 상세 조회 중 오류가 발생했습니다." }, { status: 500 });
  }
}
