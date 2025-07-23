import { writable, get } from 'svelte/store';
import type { Theme } from '$lib/types';
import { extractColors } from '$lib/utils/colorExtractor';
import { settings } from './settings';

const defaultTheme: Theme = {
  primary: '#ff0080',
  secondary: '#00ff88',
  accent: '#00ffff',
  background: 'rgba(0, 0, 0, 0.5)',
  text: '#ffffff'
};

function createThemeStore() {
  const { subscribe, set, update } = writable<Theme>(defaultTheme);
  
  async function updateFromWallpaper(imageUrl: string) {
    const currentSettings = get(settings);
    
    if (!currentSettings.theme.extractColors && currentSettings.theme.customPrimary) {
      // Use custom colors
      set({
        primary: currentSettings.theme.customPrimary,
        secondary: currentSettings.theme.customSecondary || defaultTheme.secondary,
        accent: currentSettings.theme.customAccent || defaultTheme.accent,
        background: 'rgba(0, 0, 0, 0.5)',
        text: '#ffffff'
      });
      
      updateCSSVariables();
      return;
    }
    
    try {
      const colors = await extractColors(imageUrl);
      
      set({
        primary: colors.primary || defaultTheme.primary,
        secondary: colors.secondary || defaultTheme.secondary,
        accent: colors.accent || defaultTheme.accent,
        background: 'rgba(0, 0, 0, 0.5)',
        text: '#ffffff'
      });
      
      updateCSSVariables();
    } catch (error) {
      console.error('Failed to extract colors:', error);
    }
  }
  
  function updateCSSVariables() {
    const currentTheme = get({ subscribe });
    
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--primary-color', currentTheme.primary);
      document.documentElement.style.setProperty('--secondary-color', currentTheme.secondary);
      document.documentElement.style.setProperty('--accent-color', currentTheme.accent);
    }
  }
  
  return {
    subscribe,
    updateFromWallpaper,
    reset: () => set(defaultTheme)
  };
}

export const theme = createThemeStore();
