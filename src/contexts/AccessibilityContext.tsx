import React, { createContext, useContext, useState, useEffect } from 'react';

interface AccessibilitySettings {
  // Visual preferences
  highContrast: boolean;
  fontSize: 'normal' | 'large' | 'extra-large';
  reduceMotion: boolean;
  
  // Interaction preferences
  responseTime: number; // in milliseconds
  touchSensitivity: number; // 1-5 scale
  
  // Cognitive preferences
  toolComplexity: 'beginner' | 'intermediate' | 'advanced';
  guidanceLevel: 'minimal' | 'moderate' | 'extensive';
  
  // Audio preferences
  audioFeedback: boolean;
  backgroundMusic: boolean;
  musicVolume: number; // 0-100
}

interface AccessibilityContextType extends AccessibilitySettings {
  updateSetting: <K extends keyof AccessibilitySettings>(
    setting: K,
    value: AccessibilitySettings[K]
  ) => void;
  resetToDefaults: () => void;
}

const defaultSettings: AccessibilitySettings = {
  highContrast: false,
  fontSize: 'normal',
  reduceMotion: false,
  responseTime: 300,
  touchSensitivity: 3,
  toolComplexity: 'beginner',
  guidanceLevel: 'moderate',
  audioFeedback: true,
  backgroundMusic: true,
  musicVolume: 50,
};

const AccessibilityContext = createContext<AccessibilityContextType>({
  ...defaultSettings,
  updateSetting: () => {},
  resetToDefaults: () => {},
});

export const useAccessibility = () => useContext(AccessibilityContext);

interface AccessibilityProviderProps {
  children: any; // Replace with any type to avoid ReactNode type error
}

export const AccessibilityProvider = ({ children }: AccessibilityProviderProps) => {
  // Load settings from localStorage if available
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    const savedSettings = localStorage.getItem('accessibilitySettings');
    return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
  });

  // Update localStorage when settings change
  useEffect(() => {
    localStorage.setItem('accessibilitySettings', JSON.stringify(settings));
    
    // Apply settings to document
    document.documentElement.classList.toggle('high-contrast', settings.highContrast);
    document.documentElement.setAttribute('data-font-size', settings.fontSize);
    document.documentElement.classList.toggle('reduce-motion', settings.reduceMotion);
    
    // Set CSS variables for adaptive interface
    document.documentElement.style.setProperty('--response-time', `${settings.responseTime}ms`);
    document.documentElement.style.setProperty('--touch-sensitivity', settings.touchSensitivity.toString());
  }, [settings]);

  // Function to update a single setting
  const updateSetting = <K extends keyof AccessibilitySettings>(
    setting: K,
    value: AccessibilitySettings[K]
  ) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value,
    }));
  };

  // Function to reset all settings to defaults
  const resetToDefaults = () => {
    setSettings(defaultSettings);
  };

  return (
    <AccessibilityContext.Provider
      value={{
        ...settings,
        updateSetting,
        resetToDefaults,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}; 