
import React, { useState, useEffect } from 'react';

interface CardNumberInputProps {
  numberOfCards: number;
  onSubmitNumbers: (numbers: number[]) => void;
  onGoBack: () => void;
  t: (key: string, ...args: any[]) => string; // Updated t function signature
}

const CardNumberInput: React.FC<CardNumberInputProps> = ({ numberOfCards, onSubmitNumbers, onGoBack, t }) => {
  const [inputNumbers, setInputNumbers] = useState<string[]>(Array(numberOfCards).fill(''));
  const [error, setError] = useState<string>('');

  useEffect(() => {
    setInputNumbers(Array(numberOfCards).fill(''));
    setError('');
  }, [numberOfCards]);

  const handleInputChange = (index: number, value: string) => {
    const newNumbers = [...inputNumbers];
    // Allow only digits, restrict to 2 digits for 1-78 range
    if (/^\d*$/.test(value) && value.length <= 2) {
      newNumbers[index] = value;
      setInputNumbers(newNumbers);
      setError(''); // Clear error on valid input
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const parsedNumbers: number[] = [];
    const seenNumbers = new Set<number>();

    for (let i = 0; i < inputNumbers.length; i++) {
      const strNum = inputNumbers[i];
      if (!strNum) {
        setError(t('errorEnterNumberForCard', i + 1));
        return;
      }
      const num = parseInt(strNum, 10);
      if (isNaN(num) || num < 1 || num > 78) {
        // Use t function with multiple arguments for this error message
        setError(t('errorInvalidNumberForCard', strNum, i + 1));
        return;
      }
      if (seenNumbers.has(num)) {
        setError(t('errorDuplicateNumber', num));
        return;
      }
      parsedNumbers.push(num);
      seenNumbers.add(num);
    }

    if (parsedNumbers.length === numberOfCards) {
      onSubmitNumbers(parsedNumbers);
    }
  };
  
  // Removed unused getInvalidNumberError and newHandleSubmit functions

  return (
    <div className="w-full max-w-xl mx-auto p-6 bg-slate-800 rounded-xl shadow-2xl">
      <h2 className="text-3xl font-bold text-center text-purple-400 mb-6">{t('cardNumberInputTitle')}</h2>
      <p className="text-center text-slate-300 mb-6">
        {t('cardNumberInstruction', numberOfCards)}
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 ${numberOfCards === 1 ? 'justify-center' : ''}`}>
          {inputNumbers.map((numStr, index) => (
            <div key={index} className="flex flex-col items-center">
              <label htmlFor={`card-num-${index}`} className="text-sm text-slate-400 mb-1">
                {/* Using t with multiple arguments if cardLabelPrefix/Suffix were ever to need them, though currently they don't.
                    For "第 {0} 張牌" like structure if it was a single key: t('cardLabelWithPlaceholder', index + 1)
                    Current approach is fine: t('cardLabelPrefix') + (index + 1) + t('cardLabelSuffix')
                */}
                {t('cardLabelPrefix')}{index + 1}{t('cardLabelSuffix')}
              </label>
              <input
                id={`card-num-${index}`}
                type="text" 
                value={numStr}
                onChange={(e) => handleInputChange(index, e.target.value)}
                maxLength={2}
                className="w-20 p-3 text-center bg-slate-700 text-slate-100 border border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-colors"
                aria-label={`${t('cardLabelPrefix')}${index + 1}${t('cardLabelSuffix')}`}
              />
            </div>
          ))}
        </div>
        {error && <p className="text-red-400 text-sm text-center mt-4" role="alert">{error}</p>}
        <div className="flex flex-col sm:flex-row-reverse gap-3 pt-4">
            <button
              type="submit"
              className="w-full sm:w-auto flex-grow py-3 px-6 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-slate-800"
            >
              {t('submitCardsButton')}
            </button>
            <button
              type="button"
              onClick={onGoBack}
              className="w-full sm:w-auto py-3 px-6 bg-slate-600 hover:bg-slate-500 text-slate-100 font-semibold rounded-lg shadow-sm transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-800"
            >
              {t('goBackButton')}
            </button>
        </div>
      </form>
    </div>
  );
};

export default CardNumberInput;
