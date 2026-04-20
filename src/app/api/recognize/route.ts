import { getAI, MODELS, ITEM_RECOGNITION_PROMPT } from "@/lib/gemini";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const { image } = await request.json();

    if (!image) {
      return Response.json(
        { error: "이미지가 제공되지 않았습니다." },
        { status: 400 }
      );
    }

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
    const result = JSON.parse(jsonStr);

    return Response.json(result);
  } catch (error) {
    console.error("Recognition error:", error);
    return Response.json(
      { error: "아이템 인식 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
