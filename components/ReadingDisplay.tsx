
import React from 'react';
import { ReadingSession } from '../types';
import LoadingSpinner from './LoadingSpinner';
import { Locale } from '../locales';

interface ReadingDisplayProps {
  readingSession: ReadingSession | null;
  onDownloadSummary: () => void;
  onStartNewReading: () => void;
  isGeneratingImages?: boolean; 
  language: Locale;
  t: (key: string, params?: any) => string;
}

export const SummaryCardContent: React.FC<{readingSession: ReadingSession, t: (key: string, params?: any) => string, language: Locale}> = ({ readingSession, t, language }) => {
  if (!readingSession) return null;

  return (
    <div id="summaryCardNode" className="p-6 bg-slate-700 text-slate-100 w-[400px] border border-purple-500 rounded-lg shadow-xl flex flex-col" style={{minHeight: '500px'}}>
      <h3 className="text-lg font-semibold text-purple-300 mb-2 text-center">{t('summaryCardTitle')}</h3>
      
      <div className="mb-3">
        <p className="text-sm text-slate-400">{t('yourQuestionLabelShort')}</p>
        <p className="text-base text-slate-200">{readingSession.question}</p>
      </div>

      <div className="mb-3">
        <p className="text-sm text-slate-400">{t('spreadLabelShort')}{readingSession.spreadName}</p>
        <p className="text-sm text-slate-400">{t('drawnCardsLabelShort')}</p>
        <ul className="list-disc list-inside ml-1 space-y-0.5">
          {readingSession.cards.map((selectedCard, index) => (
            <li key={index} className="text-xs text-slate-300">
              {language === 'zh-TW' ? selectedCard.card.name_tw : selectedCard.card.name} ({selectedCard.positionName})
            </li>
          ))}
        </ul>
      </div>
      
      <div className="flex-grow mt-4">
        <p className="text-sm text-slate-400">{t('oracleLabelShort')}</p>
        {/* Removed bg-slate-600 from the next line */}
        <p className="text-sm text-slate-100 whitespace-pre-wrap leading-relaxed p-2 rounded min-h-[80px] flex items-center justify-center text-center">
          {readingSession.conciseSummary && readingSession.conciseSummary !== t('generatingOracle', language) // Check against translated loading message
            ? readingSession.conciseSummary 
            : t('generatingOracle')}
        </p>
      </div>
       <p className="text-center text-xs text-purple-400 mt-auto pt-3">{t('summaryCardFooter')}</p>
    </div>
  );
};


const ReadingDisplay: React.FC<ReadingDisplayProps> = ({ readingSession, onDownloadSummary, onStartNewReading, isGeneratingImages, language, t }) => {
  if (!readingSession || !readingSession.overallInterpretation || (!readingSession.conciseSummary && readingSession.overallInterpretation !== t('generatingReading', language))) {
    return <LoadingSpinner message={t('generatingReadingDefault')} t={t} />;
  }
   if (readingSession.overallInterpretation === t('generatingReading', language) || readingSession.conciseSummary === t('generatingOracle', language)) {
     return <LoadingSpinner message={t('generatingReading')} t={t} />;
   }


  const { question, spreadName, cards, overallInterpretation } = readingSession;

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 bg-slate-800 rounded-xl shadow-2xl">
      <h2 className="text-3xl font-bold text-center text-purple-400 mb-6">{t('readingDisplayTitle')}</h2>
      
      <div className="mb-6 p-4 bg-slate-700 rounded-lg">
        <p className="text-slate-300 text-sm">{t('yourQuestionLabel')}</p>
        <p className="text-lg text-purple-300 font-semibold">{question}</p>
      </div>

      <div className="mb-6 p-4 bg-slate-700 rounded-lg">
        <p className="text-slate-300 text-sm">{t('spreadTypeLabel')} <span className="text-purple-300">{spreadName}</span></p>
      </div>

      <h3 className="text-2xl font-semibold text-purple-400 mb-4">{t('drawnCardsLabel')}</h3>
      {isGeneratingImages && cards.every(c => !c.generatedImage) && <LoadingSpinner message={t('generatingImages')} t={t} />}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 ${cards.length > 3 ? 'xl:grid-cols-4' : ''} ${cards.length > 5 ? 'xl:grid-cols-5' : ''}`}>
        {cards.map((selectedCard, index) => (
          <div key={index} className="bg-slate-700 p-4 rounded-lg shadow-lg flex flex-col items-center text-center">
            <h4 className="text-lg font-semibold text-purple-300 mb-1">
              {language === 'zh-TW' ? selectedCard.card.name_tw : selectedCard.card.name}
            </h4>
            <p className="text-xs text-slate-400 mb-2">({selectedCard.positionName})</p>
            {selectedCard.generatedImage ? (
              <img 
                src={selectedCard.generatedImage} 
                alt={language === 'zh-TW' ? selectedCard.card.name_tw : selectedCard.card.name}
                className="w-full h-auto object-cover rounded-md shadow-md aspect-[2/3] border-2 border-purple-500/50" 
              />
            ) : (
              <div className="w-full aspect-[2/3] bg-slate-600 rounded-md flex items-center justify-center border-2 border-purple-500/50">
                {isGeneratingImages && !selectedCard.generatedImage 
                  ? <LoadingSpinner message={t('imageGenerating')} t={t} /> 
                  : <p className="text-slate-400 text-sm">{t('imageFailed')}</p>}
              </div>
            )}
          </div>
        ))}
      </div>

      <h3 className="text-2xl font-semibold text-purple-400 mb-4">{t('aiInterpretationLabel')}</h3>
      <div className="p-4 bg-slate-700 rounded-lg prose prose-invert max-w-none prose-p:text-slate-200 prose-headings:text-purple-300">
        <p className="whitespace-pre-wrap text-slate-200 leading-relaxed">{overallInterpretation}</p>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
        <button
          onClick={onDownloadSummary}
          disabled={!readingSession.conciseSummary || readingSession.conciseSummary === t('generatingOracle', language)}
          className="py-3 px-6 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {t('downloadSummaryButton')}
        </button>
        <button
          onClick={onStartNewReading}
          className="py-3 px-6 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-slate-800"
        >
          {t('newReadingButton')}
        </button>
      </div>
      <div className="fixed -left-[9999px] top-0" aria-hidden="true">
         {readingSession && <SummaryCardContent readingSession={readingSession} t={t} language={language} />}
      </div>
    </div>
  );
};

export default ReadingDisplay;
