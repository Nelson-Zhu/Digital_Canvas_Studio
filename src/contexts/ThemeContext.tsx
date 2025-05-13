import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ThemeContextType {
  highContrast: boolean;
  toggleHighContrast: () => void;
  fontSize: 'normal' | 'large' | 'extra-large';
  setFontSize: (size: 'normal' | 'large' | 'extra-large') => void;
  reduceMotion: boolean;
  toggleReduceMotion: () => void;
  responseTime: number; // in milliseconds
  setResponseTime: (time: number) => void;
}

const defaultContext: ThemeContextType = {
  highContrast: false,
  toggleHighContrast: () => {},
  fontSize: 'normal',
  setFontSize: () => {},
  reduceMotion: false,
  toggleReduceMotion: () => {},
  responseTime: 300,
  setResponseTime: () => {},
};

export const ThemeContext = createContext<ThemeContextType>(defaultContext);

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  // Load settings from localStorage if available
  const [highContrast, setHighContrast] = useState<boolean>(() => {
    const saved = localStorage.getItem('highContrast');
    return saved ? JSON.parse(saved) : false;
  });
  
  const [fontSize, setFontSizeState] = useState<'normal' | 'large' | 'extra-large'>(() => {
    const saved = localStorage.getItem('fontSize');
    return saved ? JSON.parse(saved) : 'normal';
  });
  
  const [reduceMotion, setReduceMotion] = useState<boolean>(() => {
    const saved = localStorage.getItem('reduceMotion');
    return saved ? JSON.parse(saved) : false;
  });
  
  const [responseTime, setResponseTimeState] = useState<number>(() => {
    const saved = localStorage.getItem('responseTime');
    return saved ? JSON.parse(saved) : 300;
  });

  // Update localStorage when settings change
  useEffect(() => {
    localStorage.setItem('highContrast', JSON.stringify(highContrast));
    document.documentElement.classList.toggle('high-contrast', highContrast);
  }, [highContrast]);

  useEffect(() => {
    localStorage.setItem('fontSize', JSON.stringify(fontSize));
    document.documentElement.setAttribute('data-font-size', fontSize);
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem('reduceMotion', JSON.stringify(reduceMotion));
    document.documentElement.classList.toggle('reduce-motion', reduceMotion);
  }, [reduceMotion]);

  useEffect(() => {
    localStorage.setItem('responseTime', JSON.stringify(responseTime));
  }, [responseTime]);

  // Theme toggle functions
  const toggleHighContrast = () => setHighContrast(prev => !prev);
  const setFontSize = (size: 'normal' | 'large' | 'extra-large') => setFontSizeState(size);
  const toggleReduceMotion = () => setReduceMotion(prev => !prev);
  const setResponseTime = (time: number) => setResponseTimeState(time);

  return (
    <ThemeContext.Provider 
      value={{
        highContrast,
        toggleHighContrast,
        fontSize,
        setFontSize,
        reduceMotion,
        toggleReduceMotion,
        responseTime,
        setResponseTime,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}; 