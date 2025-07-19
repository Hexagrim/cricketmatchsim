import React, { useState, useEffect } from 'react';

interface AIToastProps {
  id: number;
  message: string;
  type: 'success' | 'error';
  onDismiss: (id: number) => void;
}

const AIToast: React.FC<AIToastProps> = ({ id, message, type, onDismiss }) => {
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFadingOut(true);
    }, 5000); // 5 seconds visible

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isFadingOut) {
      const fadeOutTimer = setTimeout(() => {
        onDismiss(id);
      }, 300); // Match animation duration
      return () => clearTimeout(fadeOutTimer);
    }
  }, [isFadingOut, id, onDismiss]);

  const bgColor = type === 'success' ? 'bg-green-500/80' : 'bg-red-500/80';
  const borderColor = type === 'success' ? 'border-green-400' : 'border-red-400';

  return (
    <div
      className={`max-w-md w-full ${bgColor} backdrop-blur-sm text-white p-4 rounded-lg shadow-2xl border ${borderColor} ${isFadingOut ? 'animate-fade-out' : 'animate-fade-in'}`}
      role="alert"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 pt-0.5">
           {type === 'success' ? '🏆' : '⚠️'}
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <div className="ml-4 flex-shrink-0 flex">
            <button onClick={() => setIsFadingOut(true)} className="inline-flex text-white rounded-md hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                <span className="sr-only">Close</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </button>
        </div>
      </div>
    </div>
  );
};

export default AIToast;
