import { getDb } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();

    const style = db
      .prepare(
        `SELECT s.*, u.name as user_name, u.profile_image as user_profile
         FROM styles s JOIN users u ON s.user_id = u.id
         WHERE s.id = ?`
      )
      .get(id);

    if (!style) {
      return Response.json({ error: "스타일을 찾을 수 없습니다." }, { status: 404 });
    }

    return Response.json({ style });
  } catch (error) {
    console.error("Style detail error:", error);
    return Response.json(
      { error: "스타일 정보를 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
