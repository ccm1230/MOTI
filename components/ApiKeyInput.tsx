
import React, { useState } from 'react';

interface ApiKeyInputProps {
  onSubmitKey: (apiKey: string) => void;
  t: (key: string, params?: any) => string;
  errorMessage?: string; // Optional error message from App.tsx
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onSubmitKey, t, errorMessage }) => {
  const [apiKey, setApiKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitKey(apiKey);
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 sm:p-8 bg-slate-800 rounded-xl shadow-2xl">
      <h2 className="text-3xl font-bold text-center text-purple-400 mb-6">{t('apiKeyEntryTitle')}</h2>
      <p className="text-slate-300 text-center text-sm mb-6">{t('apiKeyInstruction')}</p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="apiKey" className="sr-only">{t('apiKeyPlaceholder')}</label>
          <input
            id="apiKey"
            type="password" // Mask API key input
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={t('apiKeyPlaceholder')}
            className="w-full p-3 bg-slate-700 text-slate-100 border border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-colors"
            aria-describedby={errorMessage ? "api-key-error" : undefined}
            required
          />
        </div>
        {errorMessage && (
            <p id="api-key-error" className="text-red-400 text-sm text-center" role="alert">
                {errorMessage}
            </p>
        )}
        <button
          type="submit"
          className="w-full py-3 px-6 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!apiKey.trim()}
        >
          {t('applyApiKeyButton')}
        </button>
      </form>
    </div>
  );
};

export default ApiKeyInput;
