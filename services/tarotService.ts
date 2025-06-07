
import { TarotCard } from '../types';

// Fisher-Yates (aka Knuth) Shuffle Algorithm
export function shuffleDeck(deck: TarotCard[]): TarotCard[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function getCardByNumber(shuffledDeck: TarotCard[], number: number): TarotCard | undefined {
  // User inputs 1-78, array is 0-indexed
  if (number < 1 || number > shuffledDeck.length) {
    return undefined;
  }
  return shuffledDeck[number - 1];
}
