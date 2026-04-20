import { getDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getAI, MODELS, ITEM_RECOGNITION_PROMPT } from "@/lib/gemini";

export const maxDuration = 60;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sort = searchParams.get("sort") || "latest";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = 20;
    const offset = (page - 1) * limit;

    const db = getDb();

    const orderBy = sort === "popular" ? "s.likes_count DESC" : "s.created_at DESC";

    const styles = db
      .prepare(
        `SELECT s.id, s.user_id, s.image_url, s.analysis_json, s.likes_count, s.created_at,
                u.name as user_name, u.profile_image as user_profile
         FROM styles s
         JOIN users u ON s.user_id = u.id
         WHERE s.is_hidden = 0
         ORDER BY ${orderBy}
         LIMIT ? OFFSET ?`
      )
      .all(limit, offset);

    const total = (db.prepare("SELECT COUNT(*) as count FROM styles WHERE is_hidden = 0").get() as { count: number }).count;

    return Response.json({
      styles,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Styles GET error:", error);
    return Response.json(
      { error: "스타일 목록을 불러오는 중 오류가 발생했습니다." },
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

    const { image } = await request.json();
    if (!image) {
      return Response.json({ error: "이미지가 필요합니다." }, { status: 400 });
    }

    // Auto-recognize items via Gemini
    let analysisJson = "{}";
    try {
      const response = await getAI().models.generateContent({
        model: MODELS.TEXT,
        contents: [
          {
            role: "user",
            parts: [
              { text: ITEM_RECOGNITION_PROMPT },
              { inlineData: { mimeType: "image/jpeg", data: image } },
            ],
          },
        ],
      });

      const text = response.text ?? "";
      const jsonStr = text
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      analysisJson = jsonStr;
      // Validate JSON
      JSON.parse(jsonStr);
    } catch {
      analysisJson = JSON.stringify({ items: [] });
    }

    const db = getDb();
    const imageUrl = `data:image/jpeg;base64,${image}`;

    const result = db
      .prepare("INSERT INTO styles (user_id, image_url, analysis_json) VALUES (?, ?, ?)")
      .run(user.id, imageUrl, analysisJson);

    const style = db
      .prepare(
        `SELECT s.*, u.name as user_name, u.profile_image as user_profile
         FROM styles s JOIN users u ON s.user_id = u.id
         WHERE s.id = ?`
      )
      .get(result.lastInsertRowid);

    return Response.json({ style });
  } catch (error) {
    console.error("Styles POST error:", error);
    return Response.json(
      { error: "스타일 업로드 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
