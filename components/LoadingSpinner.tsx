
import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  t: (key: string, params?: any) => string; // Add t prop
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message, t }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-8">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
      <p className="text-lg text-purple-300">{message || t('loadingSpinnerDefault')}</p>
    </div>
  );
};

export default LoadingSpinner;
