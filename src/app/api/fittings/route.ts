import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const db = getDb();
    const fittings = db
      .prepare("SELECT * FROM fittings WHERE user_id = ? ORDER BY created_at DESC LIMIT 50")
      .all(user.id);

    return Response.json({ fittings });
  } catch (error) {
    console.error("Fittings error:", error);
    return Response.json(
      { error: "피팅 기록을 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const { myImage, styleImage, resultImage, selectedItems } = await request.json();

    const db = getDb();
    db.prepare(
      "INSERT INTO fittings (user_id, my_image, style_image, result_image, selected_items) VALUES (?, ?, ?, ?, ?)"
    ).run(
      user.id,
      myImage ? `data:image/jpeg;base64,${myImage}` : null,
      styleImage ? `data:image/jpeg;base64,${styleImage}` : null,
      resultImage ? `data:image/png;base64,${resultImage}` : null,
      JSON.stringify(selectedItems || [])
    );

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Save fitting error:", error);
    return Response.json(
      { error: "피팅 결과 저장 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
