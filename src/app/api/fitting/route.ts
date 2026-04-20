import { getAI, MODELS, VIRTUAL_FITTING_PROMPT } from "@/lib/gemini";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const { myImage, styleImage, selectedItems } = await request.json();

    if (!myImage || !styleImage) {
      return Response.json(
        { error: "두 장의 이미지가 필요합니다." },
        { status: 400 }
      );
    }

    if (!selectedItems || selectedItems.length === 0) {
      return Response.json(
        { error: "피팅할 아이템을 선택해주세요." },
        { status: 400 }
      );
    }

    const response = await getAI().models.generateContent({
      model: MODELS.IMAGE,
      contents: [
        {
          role: "user",
          parts: [
            { text: VIRTUAL_FITTING_PROMPT(selectedItems) },
            { inlineData: { mimeType: "image/jpeg", data: myImage } },
            { inlineData: { mimeType: "image/jpeg", data: styleImage } },
          ],
        },
      ],
      config: {
        responseModalities: ["TEXT", "IMAGE"],
      },
    });

    let resultImage: string | null = null;
    for (const part of response.candidates?.[0]?.content?.parts ?? []) {
      if (part.inlineData) {
        resultImage = part.inlineData.data ?? null;
        break;
      }
    }

    if (!resultImage) {
      return Response.json(
        { error: "이미지 생성에 실패했습니다. 다시 시도해주세요." },
        { status: 500 }
      );
    }

    return Response.json({ image: resultImage });
  } catch (error) {
    console.error("Fitting error:", error);
    return Response.json(
      { error: "가상 피팅 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
