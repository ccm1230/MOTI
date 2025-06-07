
import React from 'react';
import { SpreadType, SpreadInfo } from '../types';
import { SPREAD_CONFIG } from '../constants';
import { Locale } from '../locales';

interface SpreadSelectorProps {
  onSelectSpread: (spreadType: SpreadType) => void;
  language: Locale;
  t: (key: string, params?: any) => string;
}

const SpreadSelector: React.FC<SpreadSelectorProps> = ({ onSelectSpread, language, t }) => {
  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-slate-800 rounded-xl shadow-2xl">
      <h2 className="text-3xl font-bold text-center text-purple-400 mb-8">{t('selectSpreadTitle')}</h2>
      <div className="space-y-6">
        {Object.entries(SPREAD_CONFIG).map(([key, config]) => {
          const spreadName = language === 'zh-TW' ? config.name_tw : config.name_en;
          const spreadDescription = language === 'zh-TW' ? config.description_tw : config.description_en;
          return (
            <button
              key={key}
              onClick={() => onSelectSpread(key as SpreadType)}
              className="w-full text-left p-6 bg-slate-700 hover:bg-purple-700 rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <h3 className="text-xl font-semibold text-purple-300 mb-2">{spreadName} ({t('spreadCardCountLabel', config.cardCount)})</h3>
              <p className="text-slate-300 text-sm">{spreadDescription}</p>
            </button>
          );
        })}
      </div>
      <p className="mt-8 text-center text-xs text-slate-400">
        {t('tarotDisclaimer')}
      </p>
    </div>
  );
};

export default SpreadSelector;
