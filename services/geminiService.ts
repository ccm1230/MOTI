
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import { SelectedCardInfo } from '../types';

let ai: GoogleGenAI | null = null;

export function initializeGeminiClient(apiKey: string): void {
  if (!apiKey || apiKey.trim() === '') {
    ai = null;
    console.warn("Attempted to initialize Gemini client with an empty API key.");
    // Optionally, could throw an error here if App.tsx doesn't pre-validate
    // throw new Error("API_KEY_EMPTY"); 
    return;
  }
  ai = new GoogleGenAI({ apiKey });
  console.log("Gemini client initialized.");
}

// Custom error constants for easier identification in App.tsx
export const GEMINI_ERROR_CLIENT_NOT_INITIALIZED = "CLIENT_NOT_INITIALIZED";
export const GEMINI_ERROR_API_CALL_FAILED = "API_CALL_FAILED";

export async function getTarotInterpretation(
  question: string,
  selectedCardsInfo: SelectedCardInfo[],
  spreadName: string // spreadName here is the localized name passed from App.tsx
): Promise<string> {
  if (!ai) {
    console.error("Gemini client not initialized in getTarotInterpretation.");
    throw new Error(GEMINI_ERROR_CLIENT_NOT_INITIALIZED);
  }

  const cardDetailsString = selectedCardsInfo
    .map(info => `${info.card.name} (代表：${info.positionName})`) // Use English card name (info.card.name) for API consistency. PositionName is already localized.
    .join('，');

  const prompt = `你是一位知識淵博且富有同情心的塔羅牌占卜師。
使用者提出的問題是：「${question}」
他們為「${spreadName}」牌陣抽了 ${selectedCardsInfo.length} 張牌。
這些牌及其代表的位置意義分別是：${cardDetailsString}。

請基於以上資訊，提供一個深入且清晰的塔羅牌解讀：
1.  逐一解釋每張牌在其對應位置的具體含義，以及它如何與使用者的問題相關聯。
2.  綜合所有牌的資訊，給出一個關於問題的整體性的洞察、建議或指引。
請用溫和、啟發性的語氣書寫，並以中文回答，避免使用markdown語法如星號進行加粗。`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-04-17',
      contents: prompt,
    });
    let interpretationText = response.text;
    interpretationText = interpretationText.replace(/\*\*(.*?)\*\*/g, '$1');
    return interpretationText;
  } catch (error) {
    console.error('Gemini API 錯誤 (解讀):', error);
    throw new Error(GEMINI_ERROR_API_CALL_FAILED);
  }
}

export async function generateCardImage(cardName: string): Promise<string> {
  if (!ai) {
    console.error("Gemini client not initialized in generateCardImage.");
    throw new Error(GEMINI_ERROR_CLIENT_NOT_INITIALIZED);
  }

  const prompt = `A visually stunning and cute Japanese anime style (e.g., kawaii, chibi aesthetic) Tarot card illustration depicting '${cardName}'. Emphasize iconic symbolism associated with this card, rendered in an adorable and charming way. Dynamic composition, vibrant and soft pastel colors, detailed character design with large expressive eyes, mystical and ethereal atmosphere with a touch of playful whimsy. High fantasy elements should also appear cute and approachable.`;
  
  try {
    const response = await ai.models.generateImages({
        model: 'imagen-3.0-generate-002',
        prompt: prompt,
        config: {numberOfImages: 1, outputMimeType: 'image/jpeg'},
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    }
    // If no images, treat as a failure for this specific card.
    // It could be a non-fatal error, so we don't throw GEMINI_ERROR_API_CALL_FAILED here,
    // allowing other images/interpretations to proceed. The UI will show a placeholder.
    console.warn(`No image generated for ${cardName}.`);
    return ""; 
  } catch (error) {
    console.error(`Gemini API 錯誤 (圖像生成 ${cardName}):`, error);
    // Similar to above, return empty string to not halt all image generation.
    // If this error implies a problem with the API key itself (e.g., auth),
    // then throwing GEMINI_ERROR_API_CALL_FAILED might be appropriate,
    // but often image generation can fail for other reasons.
    // For now, let individual image failures be non-blocking for the overall process.
    return ""; 
  }
}

export async function getConciseTarotSummary(
  fullInterpretation: string,
  question: string,
  selectedCardsInfo: SelectedCardInfo[]
): Promise<string> {
  if (!ai) {
    console.error("Gemini client not initialized in getConciseTarotSummary.");
    throw new Error(GEMINI_ERROR_CLIENT_NOT_INITIALIZED);
  }

  const cardDetailsString = selectedCardsInfo
    .map(info => `${info.card.name} (位置: ${info.positionName})`) 
    .join('；');
  
  const prompt = `你是一位精煉文字的塔羅智者。使用者先前對問題「${question}」進行了塔羅占卜，抽到的牌組為：「${cardDetailsString}」。
完整的解讀內容如下：
「${fullInterpretation}」

請基於上述完整解讀，將其濃縮成一到兩句，最長不超過50個字，精煉且深刻的「神諭」。這段神諭應著重於使用者問題的最終結果、核心洞見或最重要的行動建議。風格需簡潔有力，像一句值得深思的箴言，將用於摘要小卡上。請直接給出這句神諭，不要添加任何額外的開頭或解釋。`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-04-17',
      contents: prompt,
    });
    let summaryText = response.text;
    summaryText = summaryText.replace(/\*\*(.*?)\*\*/g, '$1'); // Clean bold
    return summaryText.trim();
  } catch (error) {
    console.error('Gemini API 錯誤 (簡明摘要):', error);
    throw new Error(GEMINI_ERROR_API_CALL_FAILED);
  }
}
