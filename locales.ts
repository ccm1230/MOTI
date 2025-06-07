
import { SpreadType } from './types';

export type Locale = 'zh-TW' | 'en';
// Updated Translations type to accept string or a function that can take any arguments and returns a string.
export type Translations = Record<string, string | ((...args: any[]) => string)>;

export const uiTranslations: Record<Locale, Translations> = {
  'zh-TW': {
    // App General
    appTitle: "神秘神諭：塔羅洞察",
    appSubtitle: "透過AI智慧，探索塔羅牌的深層指引。",
    footerCopyright: `© ${new Date().getFullYear()} 神秘神諭塔羅應用。僅供娛樂与自我探索。`,
    footerApiKeyNote: "您的 API 金鑰僅用於當前會話，不會被儲存或共享。",
    errorOccurred: "發生錯誤",
    tryAgain: "重新開始",
    loading: "正在載入...",
    generatingReading: "AI 正在深度解析您的牌陣，請稍候...",
    generatingReadingDefault: "正在準備您的占卜結果...", // Fallback for ReadingDisplay
    generatingImages: "正在生成卡牌圖像...",
    generatingOracle: "正在生成神諭...",
    oracleFailed: "神諭生成失敗。",
    interpretationFailed: "解讀失敗，請稍後再試。",
    partialInterpretationOracleFailed: "解讀不完整，無法生成神諭。",
    errorGetInterpretation: "獲取AI解讀時發生錯誤。",
    errorGetOracle: "獲取神諭摘要時發生錯誤。",
    internalErrorRetry: "發生內部錯誤，請重試。",
    downloadFailedGeneric: "下載摘要圖片失敗。",
    downloadNotReady: "摘要內容尚未準備完成，或沒有可供下載的摘要。",
    toolLoadFailed: "無法載入圖片生成工具。",

    // API Key Input & Errors
    apiKeyEntryTitle: "輸入您的 Gemini API 金鑰",
    apiKeyInstruction: "此金鑰將僅用於當前會話，不會以任何形式儲存。在瀏覽器關閉或重新整理後需要重新輸入。",
    apiKeyPlaceholder: "在此貼上您的 API 金鑰",
    applyApiKeyButton: "套用金鑰並開始",
    apiKeyRequiredError: "API 金鑰為必填項。",
    geminiClientNotInitializedError: "API金鑰未設定或客戶端初始化失敗。請返回並提供有效的API金鑰。",
    geminiApiCallFailed: "與 Gemini API 通訊時發生錯誤。請檢查您的網路連線，並確認 API 金鑰是否有效且具有所需權限。",
    apiKeyNoteFooter: "提示：AI生成的解讀內容目前主要為中文。",


    // Language Switcher
    switchToEnglish: "English",
    switchToChinese: "繁體中文",

    // SpreadSelector
    selectSpreadTitle: "選擇牌陣類型",
    spreadCardCountLabel: (count: number) => `${count}張牌`,
    tarotDisclaimer: "塔羅牌占卜僅供參考與自我探索，並非絕對預測。",

    // QuestionInput
    questionInputTitle: "輸入你的問題",
    questionPlaceholder: "例如：我最近的事業發展方向如何？",
    submitQuestionButton: "提交問題並選擇卡牌",
    goBackButton: "返回上一步",

    // CardNumberInput
    cardNumberInputTitle: "選擇你的塔羅牌",
    cardNumberInstruction: (count: number) => `請輸入 ${count} 個不同的數字 (1 到 78 之間) 來選擇你的牌。`,
    cardLabelPrefix: "第 ",
    cardLabelSuffix: " 張牌",
    errorEnterNumberForCard: (index: number) => `請為第 ${index} 張牌輸入一個數字。`,
    errorInvalidNumberForCard: (numStr: string, cardIndex: number) => `數字 ${numStr} 無效。請為第 ${cardIndex} 張牌輸入1到78之間的數字。`,
    errorDuplicateNumber: (num: number) => `數字 ${num} 重複了。請確保所有數字都是唯一的。`,
    submitCardsButton: "確認選牌並查看解讀",

    // ReadingDisplay
    readingDisplayTitle: "你的塔羅牌解讀",
    yourQuestionLabel: "你的問題：",
    spreadTypeLabel: "牌陣類型：",
    drawnCardsLabel: "抽到的牌：",
    aiInterpretationLabel: "AI 綜合解讀：",
    downloadSummaryButton: "下載占卜摘要小卡",
    newReadingButton: "開始新的占卜",
    imageGenerating: "生成中...",
    imageFailed: "圖像生成中或失敗",

    // SummaryCardContent (for downloadable card)
    summaryCardTitle: "塔羅占卜摘要",
    yourQuestionLabelShort: "你的問題：",
    spreadLabelShort: "牌陣：",
    drawnCardsLabelShort: "抽到的牌：",
    oracleLabelShort: "神諭：",
    summaryCardFooter: "神秘神諭塔羅洞察",
    
    // Loading Spinner Default
    loadingSpinnerDefault: "處理中...",
  },
  'en': {
    // App General
    appTitle: "Mystic Oracle: Tarot Insights",
    appSubtitle: "Explore the profound guidance of Tarot with AI wisdom.",
    footerCopyright: `© ${new Date().getFullYear()} Mystic Oracle Tarot App. For entertainment and self-exploration only.`,
    footerApiKeyNote: "Your API Key is used only for the current session and is not stored or shared in any way.",
    errorOccurred: "An Error Occurred",
    tryAgain: "Try Again",
    loading: "Loading...",
    generatingReading: "The AI is deeply analyzing your spread, please wait...",
    generatingReadingDefault: "Preparing your reading results...",
    generatingImages: "Generating card images...",
    generatingOracle: "Generating Oracle's Insight...",
    oracleFailed: "Oracle's Insight generation failed.",
    interpretationFailed: "Interpretation failed, please try again later.",
    partialInterpretationOracleFailed: "Interpretation incomplete, cannot generate Oracle's Insight.",
    errorGetInterpretation: "Error fetching AI interpretation.",
    errorGetOracle: "Error fetching Oracle's Insight summary.",
    internalErrorRetry: "An internal error occurred. Please try again.",
    downloadFailedGeneric: "Failed to download summary image.",
    downloadNotReady: "Summary content is not ready yet, or no summary available for download.",
    toolLoadFailed: "Failed to load image generation tool.",

    // API Key Input & Errors
    apiKeyEntryTitle: "Enter Your Gemini API Key",
    apiKeyInstruction: "This key will be used for the current session only and will not be stored. It needs to be re-entered after closing or refreshing the browser.",
    apiKeyPlaceholder: "Paste your API key here",
    applyApiKeyButton: "Apply Key & Start",
    apiKeyRequiredError: "API Key is required.",
    geminiClientNotInitializedError: "API Key not set or client initialization failed. Please go back and provide a valid API Key.",
    geminiApiCallFailed: "Error communicating with Gemini API. Please check your network connection and ensure your API Key is valid and has the necessary permissions.",
    apiKeyNoteFooter: "Note: AI-generated interpretations are currently primarily in Chinese.",


    // Language Switcher
    switchToEnglish: "English",
    switchToChinese: "繁體中文",

    // SpreadSelector
    selectSpreadTitle: "Select Spread Type",
    spreadCardCountLabel: (count: number) => `${count}-Card`,
    tarotDisclaimer: "Tarot readings are for reference and self-exploration, not absolute predictions.",

    // QuestionInput
    questionInputTitle: "Enter Your Question",
    questionPlaceholder: "e.g., What is the direction of my career path recently?",
    submitQuestionButton: "Submit Question & Select Cards",
    goBackButton: "Go Back",

    // CardNumberInput
    cardNumberInputTitle: "Select Your Tarot Cards",
    cardNumberInstruction: (count: number) => `Please enter ${count} different numbers (between 1 and 78) to select your cards.`,
    cardLabelPrefix: "Card ",
    cardLabelSuffix: "", // No suffix needed typically for "Card X"
    errorEnterNumberForCard: (index: number) => `Please enter a number for card ${index}.`,
    errorInvalidNumberForCard: (numStr: string, cardIndex: number) => `Number ${numStr} is invalid. Please enter a number between 1 and 78 for card ${cardIndex}.`,
    errorDuplicateNumber: (num: number) => `Number ${num} is duplicated. Please ensure all numbers are unique.`,
    submitCardsButton: "Confirm Selection & View Reading",

    // ReadingDisplay
    readingDisplayTitle: "Your Tarot Reading",
    yourQuestionLabel: "Your Question:",
    spreadTypeLabel: "Spread Type:",
    drawnCardsLabel: "Drawn Cards:",
    aiInterpretationLabel: "AI Comprehensive Interpretation:",
    downloadSummaryButton: "Download Summary Card",
    newReadingButton: "Start New Reading",
    imageGenerating: "Generating...",
    imageFailed: "Image generating or failed",
    
    // SummaryCardContent (for downloadable card)
    summaryCardTitle: "Tarot Reading Summary",
    yourQuestionLabelShort: "Your Question:",
    spreadLabelShort: "Spread:",
    drawnCardsLabelShort: "Drawn Cards:",
    oracleLabelShort: "Oracle's Insight:",
    summaryCardFooter: "Mystic Oracle Tarot Insights",

    // Loading Spinner Default
    loadingSpinnerDefault: "Processing...",
  },
};

export function getTranslator(lang: Locale) {
  // The 't' function now uses rest parameters for arguments to translation functions.
  return function t(key: string, ...args: any[]): string {
    const currentLocaleTranslations = uiTranslations[lang];
    let translationEntry = currentLocaleTranslations?.[key];

    // Fallback logic: if key is not found in the current language, try the default fallback (zh-TW).
    if (translationEntry === undefined) {
      const fallbackLocaleTranslations = uiTranslations['zh-TW']; 
      translationEntry = fallbackLocaleTranslations?.[key];
    }

    // If still not found after fallback, return the key itself.
    if (translationEntry === undefined) {
      console.warn(`Translation key '${key}' not found in locale '${lang}' or fallback 'zh-TW'.`);
      return key;
    }

    // If the translation entry is a function, call it with the provided arguments.
    if (typeof translationEntry === 'function') {
      return translationEntry(...args);
    }

    // If it's a string and arguments were provided, attempt simple placeholder replacement.
    // e.g., "Card {0} of {1}" with t('key', 'Ace', 'Swords') becomes "Card Ace of Swords"
    if (args.length > 0 && typeof translationEntry === 'string') {
      let result = translationEntry;
      args.forEach((arg, index) => {
        const placeholder = `{${index}}`;
        // Using split/join for global replacement to avoid issues with special characters in `arg` if using RegExp.
        result = result.split(placeholder).join(String(arg));
      });
      return result;
    }
    
    // If it's a string and no arguments for replacement, return it directly.
    return translationEntry;
  };
}
