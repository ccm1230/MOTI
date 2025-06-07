
export interface TarotCard {
  id: number;
  name: string; // English name for API, and default display
  name_tw: string; // Taiwanese Traditional Chinese name for display
  arcana: 'Major' | 'Minor';
  suit?: 'Wands' | 'Cups' | 'Swords' | 'Pentacles'; // For Minor Arcana
}

export enum SpreadType {
  SINGLE = 'SINGLE',
  THREE_CARD = 'THREE_CARD',
  CELTIC_CROSS = 'CELTIC_CROSS',
}

export interface SpreadInfo {
  // name: string; // Original, to be replaced by localized versions
  name_en: string; 
  name_tw: string;
  cardCount: number;
  // description: string; // Original
  description_en: string;
  description_tw: string;
  // positions: string[]; // Original
  positions_en: string[]; 
  positions_tw: string[];
}

export interface SelectedCardInfo {
  card: TarotCard;
  numberInput: number; // The number user entered (1-78)
  positionName: string; // e.g., "過去", "現在" (this will be localized before being set)
  generatedImage?: string; // base64 image string
}

export interface ReadingSession {
  question: string;
  spreadType: SpreadType;
  spreadName: string; // This will be the localized spread name
  cards: SelectedCardInfo[];
  overallInterpretation: string;
  conciseSummary?: string; // For the refined summary on the downloadable card
}

// Removed the ProcessEnv interface. API_KEY is now handled via session input.
// declare global {
//   namespace NodeJS {
//     interface ProcessEnv {
//       API_KEY: string; 
//     }
//   }
// }
