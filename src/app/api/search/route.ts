import { getAI, MODELS, SEARCH_QUERY_PROMPT } from "@/lib/gemini";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const { item } = await request.json();

    if (!item) {
      return Response.json(
        { error: "아이템 정보가 제공되지 않았습니다." },
        { status: 400 }
      );
    }

    const response = await getAI().models.generateContent({
      model: MODELS.TEXT,
      contents: SEARCH_QUERY_PROMPT(item),
    });

    const keyword = (response.text ?? "").trim();
    const url = `https://www.google.com/search?q=${encodeURIComponent(keyword)}&tbm=shop`;

    return Response.json({ keyword, url });
  } catch (error) {
    console.error("Search error:", error);
    return Response.json(
      { error: "검색 키워드 생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
