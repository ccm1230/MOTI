
import React, { useState, useEffect, useCallback } from 'react';
import { TarotCard, SpreadType, SelectedCardInfo, ReadingSession } from './types';
import { TAROT_DECK, SPREAD_CONFIG } from './constants';
import { shuffleDeck, getCardByNumber } from './services/tarotService';
import { 
  initializeGeminiClient, 
  getTarotInterpretation, 
  generateCardImage, 
  getConciseTarotSummary,
  GEMINI_ERROR_CLIENT_NOT_INITIALIZED,
  GEMINI_ERROR_API_CALL_FAILED
} from './services/geminiService';
import SpreadSelector from './components/SpreadSelector';
import QuestionInput from './components/QuestionInput';
import CardNumberInput from './components/CardNumberInput';
import ReadingDisplay from './components/ReadingDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import ApiKeyInput from './components/ApiKeyInput'; // New component
import { Locale, getTranslator } from './locales';


declare var html2canvas: any;

type AppStep = 'REQUIRE_API_KEY' | 'SELECT_SPREAD' | 'ENTER_QUESTION' | 'SELECT_CARDS' | 'GENERATING_READING' | 'VIEW_READING';

const getHtml2Canvas = (): typeof html2canvas | null => {
  if (typeof window !== 'undefined' && (window as any).html2canvas) {
    return (window as any).html2canvas;
  }
  return null;
};


const App: React.FC = () => {
  const [language, setLanguage] = useState<Locale>('zh-TW');
  const t = useCallback(getTranslator(language), [language]);
  
  // API Key is no longer from process.env. It's managed via UI input for the session.
  // const [isApiKeyConfigured, setIsApiKeyConfigured] = useState<boolean>(() => { ... }); // Removed

  const [currentStep, setCurrentStep] = useState<AppStep>('REQUIRE_API_KEY');
  const [selectedSpreadType, setSelectedSpreadType] = useState<SpreadType | null>(null);
  const [numberOfCardsToDraw, setNumberOfCardsToDraw] = useState<number>(0);
  const [userQuestion, setUserQuestion] = useState<string>('');
  const [shuffledDeckState, setShuffledDeckState] = useState<TarotCard[]>([]);
  const [currentReadingSession, setCurrentReadingSession] = useState<ReadingSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGeneratingImages, setIsGeneratingImages] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  

  useEffect(() => {
    document.documentElement.lang = language === 'zh-TW' ? 'zh-TW' : 'en';
    setErrorMessage(''); // Clear error on language change
  }, [language]);


  useEffect(() => {
    // Reset app state when moving to SELECT_SPREAD, but only if an API key has been conceptually set (i.e., not in REQUIRE_API_KEY step).
    if (currentStep === 'SELECT_SPREAD') {
      setShuffledDeckState(shuffleDeck(TAROT_DECK));
      setSelectedSpreadType(null);
      setNumberOfCardsToDraw(0);
      setUserQuestion('');
      // Preserve current reading session if user is just changing language on view_reading page,
      // otherwise clear it for a new reading.
      // The check below is to avoid clearing if we are coming from REQUIRE_API_KEY to SELECT_SPREAD for the first time
      // or if we are just navigating back to SELECT_SPREAD.
      // This reset primarily targets starting a fresh reading flow.
      if (currentReadingSession && (currentReadingSession.overallInterpretation || currentReadingSession.conciseSummary)) {
         // If we are truly starting a new session (not just going back from question input), clear it.
         // This logic might need refinement based on precise "new reading" definition.
         // For now, assume moving to SELECT_SPREAD from later stages implies reset.
      }
      setCurrentReadingSession(prev => {
        // Only clear if we are not coming from REQUIRE_API_KEY or if it's a genuine "new reading"
        // This ensures that if a user clicks "Start New Reading" from the results, it clears.
        // If they just go "back" to spread selector, it might not clear.
        // For now, let's be simple: if we hit SELECT_SPREAD and it's not the initial API key setup, reset parts.
        if (prev && prev.question) { // Heuristic: if there was a question, we are likely resetting for new.
           return {...prev, question: '', overallInterpretation: '', conciseSummary: undefined, cards: [] };
        }
        return null;
      });
      setIsLoading(false);
      setErrorMessage('');
      setIsGeneratingImages(false);
    }
  }, [currentStep]); // Removed isApiKeyConfigured dependency

  const handleApiKeySubmit = (apiKey: string) => {
    const trimmedKey = apiKey.trim();
    if (!trimmedKey) {
      setErrorMessage(t('apiKeyRequiredError'));
      return;
    }
    try {
      initializeGeminiClient(trimmedKey);
      setCurrentStep('SELECT_SPREAD');
      setErrorMessage('');
    } catch (error: any) { // Catch if initializeGeminiClient itself throws, though current impl does not for empty.
      console.error("Error initializing Gemini client:", error);
      setErrorMessage(t('geminiApiCallFailed')); // Generic for now
    }
  };

  const handleSelectSpread = (spreadType: SpreadType) => {
    const config = SPREAD_CONFIG[spreadType];
    setSelectedSpreadType(spreadType);
    setNumberOfCardsToDraw(config.cardCount);
    setCurrentStep('ENTER_QUESTION');
    setErrorMessage('');
  };

  const handleSubmitQuestion = (question: string) => {
    setUserQuestion(question);
    setCurrentStep('SELECT_CARDS');
    setErrorMessage('');
  };
  
  const handleGoBack = () => {
    setErrorMessage(''); 
    if (currentStep === 'ENTER_QUESTION') {
      setCurrentStep('SELECT_SPREAD');
    } else if (currentStep === 'SELECT_CARDS') {
      setCurrentStep('ENTER_QUESTION');
    } else if (currentStep === 'SELECT_SPREAD') {
        // Optionally go back to API key input, or disallow.
        // For now, let's assume once API key is set, we don't go back to its input via "Go Back"
        // setCurrentStep('REQUIRE_API_KEY');
    }
    // If on VIEW_READING, "Go Back" is not typical, "New Reading" is used.
  };


  const handleSubmitNumbers = useCallback(async (numbers: number[]) => {
    if (!selectedSpreadType || !shuffledDeckState.length || !userQuestion) {
      setErrorMessage(t('internalErrorRetry'));
      setCurrentStep('SELECT_SPREAD'); 
      return;
    }
    
    setIsLoading(true);
    setCurrentStep('GENERATING_READING');
    setErrorMessage('');

    const spreadConfig = SPREAD_CONFIG[selectedSpreadType];
    const currentLangSpreadName = language === 'zh-TW' ? spreadConfig.name_tw : spreadConfig.name_en;
    const currentLangPositions = language === 'zh-TW' ? spreadConfig.positions_tw : spreadConfig.positions_en;

    const drawnCardDetails: SelectedCardInfo[] = numbers.map((num, index) => {
      const card = getCardByNumber(shuffledDeckState, num)!; 
      return {
        card, 
        numberInput: num,
        positionName: currentLangPositions[index] || `${t('cardLabelPrefix')}${index + 1}${t('cardLabelSuffix')}`,
        generatedImage: undefined, 
      };
    });
    
    setCurrentReadingSession({
      question: userQuestion,
      spreadType: selectedSpreadType,
      spreadName: currentLangSpreadName,
      cards: [...drawnCardDetails], 
      overallInterpretation: t('generatingReading'),
      conciseSummary: t('generatingOracle'),
    });
    
    setIsGeneratingImages(true);
    // Image generation can proceed even if interpretation fails later, or vice-versa.
    // We use Promise.allSettled for image generation.
    const imageGenerationPromises = drawnCardDetails.map((detail, cardIndex) => 
      generateCardImage(detail.card.name)
        .then(imageUrl => {
          setCurrentReadingSession(prev => {
            if (!prev) return null;
            const updatedCards = [...prev.cards];
            updatedCards[cardIndex] = { ...updatedCards[cardIndex], generatedImage: imageUrl || undefined };
            return { ...prev, cards: updatedCards };
          });
        })
        .catch(e => { // Catch errors from generateCardImage (e.g., client not init)
          console.error(`Error generating image for ${detail.card.name}:`, e);
           if ((e as Error).message === GEMINI_ERROR_CLIENT_NOT_INITIALIZED) {
            // This is a critical error, re-throw or handle centrally.
            // For now, individual image failure is logged, but if it's CLIENT_NOT_INITIALIZED,
            // the interpretation will also fail and handle it.
            throw e; // Re-throw to be caught by the main try-catch
          }
          // Non-critical image failure, card will show placeholder
        })
    );

    try {
      await Promise.allSettled(imageGenerationPromises);
    } catch (imgError: any) {
       // This catch might be redundant if generateCardImage handles its own CLIENT_NOT_INITIALIZED by throwing
       // and the main try/catch below handles it.
       // If an image generation promise was rejected with CLIENT_NOT_INITIALIZED, handle it.
      if (imgError.message === GEMINI_ERROR_CLIENT_NOT_INITIALIZED) {
          setErrorMessage(t('geminiClientNotInitializedError'));
          setCurrentReadingSession(null);
          setIsLoading(false);
          setIsGeneratingImages(false);
          setCurrentStep('REQUIRE_API_KEY');
          return;
      }
      // Other image generation errors are handled by individual catches or result in empty images.
    }
    setIsGeneratingImages(false); 

    try {
      const interpretation = await getTarotInterpretation(userQuestion, drawnCardDetails, currentLangSpreadName);
      setCurrentReadingSession(prev => prev ? { ...prev, overallInterpretation: interpretation } : null);

      // Only get summary if interpretation was successful (not an error message string)
      // Basic check, can be more robust
      const interpretationFailedMessages = [t('interpretationFailed', language), t('geminiApiCallFailed', language), t('geminiClientNotInitializedError', language)];
      if (interpretation && !interpretationFailedMessages.includes(interpretation) && interpretation !== t('generatingReading', language)) {
        const summary = await getConciseTarotSummary(interpretation, userQuestion, drawnCardDetails);
        setCurrentReadingSession(prev => prev ? { ...prev, conciseSummary: summary } : null);
      } else {
         setCurrentReadingSession(prev => prev ? { ...prev, conciseSummary: t('partialInterpretationOracleFailed') } : null);
      }

    } catch (error: any) {
      console.error("Error during interpretation or summary generation:", error);
      let specificErrorMessage = t('errorGetInterpretation'); // Default

      if (error.message === GEMINI_ERROR_CLIENT_NOT_INITIALIZED) {
        specificErrorMessage = t('geminiClientNotInitializedError');
        setErrorMessage(specificErrorMessage);
        setCurrentReadingSession(null); 
        setIsLoading(false);
        setIsGeneratingImages(false);
        setCurrentStep('REQUIRE_API_KEY'); 
        return; 
      } else if (error.message === GEMINI_ERROR_API_CALL_FAILED) {
        specificErrorMessage = t('geminiApiCallFailed');
      }
      
      setErrorMessage(specificErrorMessage);
      setCurrentReadingSession(prev => prev ? { 
        ...prev, 
        overallInterpretation: specificErrorMessage, // Show API error as interpretation
        conciseSummary: t('oracleFailed') 
      } : null);
    } finally {
      setIsLoading(false);
      // Only move to VIEW_READING if not already redirected to REQUIRE_API_KEY
      if (currentStep !== 'REQUIRE_API_KEY') {
        setCurrentStep('VIEW_READING');
      }
    }

  }, [selectedSpreadType, shuffledDeckState, userQuestion, language, t, currentStep]);


  const handleDownloadSummary = async () => {
    const canvasRenderer = getHtml2Canvas();
    if (!canvasRenderer) {
      alert(t('toolLoadFailed'));
      return;
    }
    const nodeToClone = document.getElementById('summaryCardNode');
    if (nodeToClone && currentReadingSession && currentReadingSession.conciseSummary && currentReadingSession.conciseSummary !== t('generatingOracle')) {
      const firstCardWithImage = currentReadingSession.cards.find(c => c.generatedImage);
      const bgImageUrl = firstCardWithImage?.generatedImage;

      try {
        const canvas = await canvasRenderer(nodeToClone, { 
          scale: 2, 
          useCORS: true, 
          backgroundColor: bgImageUrl ? 'transparent' : '#334155', 
          onclone: (clonedDocument: Document) => {
            const clonedNode = clonedDocument.getElementById('summaryCardNode');
            if (clonedNode) {
              if (bgImageUrl) {
                clonedNode.style.backgroundImage = `url(${bgImageUrl})`;
                clonedNode.style.backgroundSize = 'cover';
                clonedNode.style.backgroundPosition = 'center';
                clonedNode.style.backgroundColor = 'transparent'; 

                const overlay = clonedDocument.createElement('div');
                overlay.style.position = 'absolute';
                overlay.style.top = '0';
                overlay.style.left = '0';
                overlay.style.right = '0';
                overlay.style.bottom = '0';
                overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.65)'; 
                overlay.style.borderRadius = 'inherit'; 
                overlay.style.display = 'flex';
                overlay.style.flexDirection = 'column';
                
                const originalPadding = window.getComputedStyle(clonedNode).padding;
                overlay.style.padding = originalPadding;
                clonedNode.style.padding = '0'; 

                while (clonedNode.firstChild) {
                  overlay.appendChild(clonedNode.firstChild);
                }
                clonedNode.appendChild(overlay);
                clonedNode.style.position = 'relative'; 

                overlay.querySelectorAll('.text-slate-100, .text-slate-200, .text-slate-300, .text-slate-400, .text-purple-300, .text-purple-400').forEach(el => {
                    if (el instanceof HTMLElement) {
                        if (el.classList.contains('text-slate-400')) {
                            el.style.color = '#e2e8f0'; 
                        } else if (el.classList.contains('text-purple-300') || el.classList.contains('text-purple-400')) {
                            el.style.color = '#f3e8ff'; 
                        } else {
                            el.style.color = '#ffffff'; 
                        }
                        el.style.textShadow = '0px 0px 3px rgba(0,0,0,0.7)'; 
                    }
                });
                const titleElement = overlay.querySelector('h3.text-purple-300');
                if (titleElement && titleElement instanceof HTMLElement) {
                    titleElement.style.color = '#f3e8ff';
                    titleElement.style.textShadow = '0px 0px 4px rgba(0,0,0,0.8)';
                }
                const footerElement = overlay.querySelector('p.text-purple-400.mt-auto');
                 if (footerElement && footerElement instanceof HTMLElement) {
                    footerElement.style.color = '#f3e8ff';
                    footerElement.style.textShadow = '0px 0px 3px rgba(0,0,0,0.7)';
                }
                const oracleTextElement = overlay.querySelector('.text-sm.text-slate-100.whitespace-pre-wrap');
                if (oracleTextElement && oracleTextElement instanceof HTMLElement) {
                    oracleTextElement.style.color = '#ffffff';
                    oracleTextElement.style.fontWeight = 'bold';
                    oracleTextElement.style.textAlign = 'center';
                    oracleTextElement.style.textShadow = '0px 0px 5px rgba(0,0,0,0.9)';
                }
              }
            }
          }
        });
        const image = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        const filenameSafeQuestion = currentReadingSession.question.substring(0,15).replace(/[^a-z0-9\u4e00-\u9fa5]/gi, '_');
        link.download = `TarotReading_${filenameSafeQuestion}_${Date.now()}.png`;
        link.href = image;
        link.click();
      } catch (error) {
        console.error('下載摘要時發生錯誤:', error);
        alert(t('downloadFailedGeneric'));
      }
    } else {
      alert(t('downloadNotReady'));
    }
  };
  
  const handleStartNewReading = () => {
    // If API key was bad and user is stuck on an error, this should ideally take them to API key input.
    // Otherwise, just go to spread selection if key is presumably still good.
    if (currentStep === 'REQUIRE_API_KEY' || errorMessage === t('geminiClientNotInitializedError') || errorMessage === t('geminiApiCallFailed') ) {
         setCurrentStep('REQUIRE_API_KEY');
    } else {
         setCurrentStep('SELECT_SPREAD'); // This will trigger the useEffect to reset states
    }
     // Clear previous error message when starting fresh
    setErrorMessage('');
    // Clear reading session for a truly new start
    setCurrentReadingSession(null);
  };

  const renderStep = () => {
    // Global error message display, takes precedence if set
    if (errorMessage && currentStep !== 'REQUIRE_API_KEY') { // Don't show global error on API key screen if it's an API key error
      return (
        <div className="w-full max-w-md mx-auto p-6 bg-red-900 bg-opacity-80 backdrop-blur-sm text-red-100 rounded-xl shadow-2xl text-center border border-red-700">
          <h2 className="text-2xl font-bold mb-4">{t('errorOccurred')}</h2>
          <p className="mb-6">{errorMessage}</p>
          <button
            onClick={handleStartNewReading} // This will now potentially go to REQUIRE_API_KEY
            className="py-2 px-6 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md transition-colors"
          >
            {t('tryAgain')}
          </button>
        </div>
      );
    }

    switch (currentStep) {
      case 'REQUIRE_API_KEY':
        return <ApiKeyInput onSubmitKey={handleApiKeySubmit} t={t} errorMessage={errorMessage} />;
      case 'SELECT_SPREAD':
        return <SpreadSelector onSelectSpread={handleSelectSpread} language={language} t={t} />;
      case 'ENTER_QUESTION':
        return <QuestionInput onSubmitQuestion={handleSubmitQuestion} onGoBack={handleGoBack} t={t} />;
      case 'SELECT_CARDS':
        if (numberOfCardsToDraw > 0) {
          return <CardNumberInput numberOfCards={numberOfCardsToDraw} onSubmitNumbers={handleSubmitNumbers} onGoBack={handleGoBack} t={t} />;
        }
        // Fallback if numberOfCardsToDraw is not set, should ideally not happen if flow is correct
        setCurrentStep('SELECT_SPREAD'); 
        return <LoadingSpinner message={t('loading')} t={t} />;
      case 'GENERATING_READING':
         return <LoadingSpinner message={isLoading ? t('generatingReading') : (isGeneratingImages ? t('generatingImages') : t('generatingReadingDefault'))} t={t} />;
      case 'VIEW_READING':
        if (!currentReadingSession) { // If session is null (e.g. after error leading back to API key)
             if (isLoading || isGeneratingImages) return <LoadingSpinner message={t('generatingReadingDefault')} t={t} />;
             // If no session and not loading, implies an error occurred that cleared it.
             // The global error message above should handle this, or we go back to API key.
             // For safety, redirect if session is null.
             setCurrentStep('REQUIRE_API_KEY');
             return <LoadingSpinner message={t('loading')} t={t} />;
        }
        return (
          <ReadingDisplay 
            readingSession={currentReadingSession}
            onDownloadSummary={handleDownloadSummary}
            onStartNewReading={handleStartNewReading}
            isGeneratingImages={isGeneratingImages}
            language={language}
            t={t}
          />
        );
      default:
        // Should not happen, but as a fallback:
        setCurrentStep('REQUIRE_API_KEY');
        return <LoadingSpinner message={t('loading')} t={t} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-slate-100 flex flex-col items-center p-4 selection:bg-purple-500 selection:text-white">
      <header className="w-full max-w-4xl mx-auto text-center mb-2 mt-6 md:mt-12">
        <div className="flex justify-center space-x-3 my-4">
            <button 
                onClick={() => setLanguage('zh-TW')} 
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors
                            ${language === 'zh-TW' ? 'bg-purple-600 text-white shadow-lg' : 'bg-slate-700 hover:bg-purple-500 text-slate-300'}`}
            >
                {t('switchToChinese')}
            </button>
            <button 
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors
                            ${language === 'en' ? 'bg-purple-600 text-white shadow-lg' : 'bg-slate-700 hover:bg-purple-500 text-slate-300'}`}
            >
                {t('switchToEnglish')}
            </button>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 py-2">
          {t('appTitle')}
        </h1>
        <p className="text-slate-300 mt-2 text-sm md:text-base">{t('appSubtitle')}</p>
      </header>
      <main className="w-full flex-grow flex items-center justify-center py-8">
        {/* Render logic changed to directly use renderStep without API key pre-check here */}
        {renderStep()}
      </main>
      <footer className="w-full max-w-4xl mx-auto text-center py-6 md:py-8 text-xs text-slate-500">
        <p>{t('footerCopyright')}</p>
        <p className="mt-1">{t('footerApiKeyNote')}</p>
         <p className="mt-2 text-slate-600 text-xs">
           {t('apiKeyNoteFooter')}
        </p>
      </footer>
    </div>
  );
};

export default App;
