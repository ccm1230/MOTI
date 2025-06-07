
import React, { useState } from 'react';

interface QuestionInputProps {
  onSubmitQuestion: (question: string) => void;
  onGoBack: () => void;
  t: (key: string, params?: any) => string;
}

const QuestionInput: React.FC<QuestionInputProps> = ({ onSubmitQuestion, onGoBack, t }) => {
  const [question, setQuestion] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim()) {
      onSubmitQuestion(question.trim());
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto p-6 bg-slate-800 rounded-xl shadow-2xl">
      <h2 className="text-3xl font-bold text-center text-purple-400 mb-6">{t('questionInputTitle')}</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={t('questionPlaceholder')}
          rows={4}
          className="w-full p-4 bg-slate-700 text-slate-100 border border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-colors"
          aria-label={t('questionInputTitle')}
        />
        <div className="flex flex-col sm:flex-row-reverse gap-3">
            <button
              type="submit"
              disabled={!question.trim()}
              className="w-full sm:w-auto flex-grow py-3 px-6 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-md transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-slate-800"
            >
              {t('submitQuestionButton')}
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

export default QuestionInput;
