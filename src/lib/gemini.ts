import { GoogleGenAI } from "@google/genai";

let _ai: GoogleGenAI | null = null;

export function getAI(): GoogleGenAI {
  if (!_ai) {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GOOGLE_GEMINI_API_KEY is not set");
    }
    _ai = new GoogleGenAI({ apiKey });
  }
  return _ai;
}

export const MODELS = {
  TEXT: "gemini-2.5-flash",
  IMAGE: "gemini-3-pro-image-preview", // Nano Banana Pro — studio-quality image generation
} as const;

export const ITEM_RECOGNITION_PROMPT = `이 사진 속 인물이 착용하고 있는 모든 패션 아이템을 분석하세요.

아래 JSON 형식으로 응답:
{
  "items": [
    {
      "category": "상의|하의|신발|모자|가방|액세서리|헤어스타일",
      "name": "아이템 이름 (예: 검정 가죽 자켓)",
      "color": "주요 색상",
      "style": "스타일 키워드 (예: 캐주얼, 스트릿, 포멀)",
      "description": "간단한 설명"
    }
  ]
}

JSON만 응답.`;

export const SEARCH_QUERY_PROMPT = (item: { name: string; color: string; style: string }) =>
  `다음 패션 아이템의 구글 쇼핑 검색 키워드를 한국어로 생성하세요.
아이템: ${item.name}, 색상: ${item.color}, 스타일: ${item.style}
검색 키워드만 한 줄로 응답. 예: "남성 검정 가죽 자켓 캐주얼"`;

export const VIRTUAL_FITTING_PROMPT = (selectedItems: string[]) => {
  const itemList = selectedItems.map((item, i) => `  ${i + 1}. ${item}`).join("\n");
  return `You are a virtual fitting AI. You have two photos.

[Photo 1] Person A — the fitting target. Keep this person's face, body, pose, and background EXACTLY unchanged.
[Photo 2] Person B — the style reference photo.

Replace the following clothing items on Person A with the matching items from Person B:
${itemList}

For example, if "상의: Black Crop Jacket" is selected, replace Person A's top/jacket with the exact top/jacket that Person B is wearing in Photo 2.

Critical rules:
1. Person A's face, skin tone, body shape, pose, and background must be IDENTICAL to Photo 1
2. Each selected item must replicate the EXACT design, color, pattern, and texture as worn by Person B in Photo 2
3. Any clothing category NOT listed above must remain exactly as Person A wears in Photo 1
4. Lighting, shadows, and proportions must be consistent and photorealistic
5. Output a single photorealistic image — no collage, no side-by-side, no text overlay, no labels

Generate ONLY the result image.`;
};
