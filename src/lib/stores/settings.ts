import { writable } from 'svelte/store';
import type { Settings } from '$lib/types';
import { browser } from '$app/environment';

const defaultSettings: Settings = {
  wallpaperFolder: 'nature',
  wallpaperInterval: 45,
  wallpaperTransition: 'fade',
  wallpaperBlur: 0,
  particleCount: 20,
  particleSpeed: 0.5,
  particleGlow: true,
  searchEngines: [
    {
      id: 'google',
      name: 'Google',
      url: 'https://www.google.com/search?q=',
      icon: '🔍'
    },
    {
      id: 'ddg',
      name: 'DuckDuckGo',
      url: 'https://duckduckgo.com/?q=',
      icon: '🦆'
    },
    {
      id: 'youtube',
      name: 'YouTube',
      url: 'https://www.youtube.com/results?search_query=',
      icon: '📺'
    },
    {
      id: 'github',
      name: 'GitHub',
      url: 'https://github.com/search?q=',
      icon: '🐙'
    }
  ],
  defaultSearchEngine: 'google',
  bookmarkGroups: [
    {
      id: 'dev',
      title: 'Development',
      icon: '💻',
      bookmarks: [
        { id: '1', title: 'GitHub', url: 'https://github.com' },
        { id: '2', title: 'Stack Overflow', url: 'https://stackoverflow.com' },
        { id: '3', title: 'MDN', url: 'https://developer.mozilla.org' }
      ]
    },
    {
      id: 'shop',
      title: 'Shopping',
      icon: '🛍️',
      bookmarks: [
        { id: '4', title: 'Amazon', url: 'https://amazon.com' },
        { id: '5', title: 'eBay', url: 'https://ebay.com' }
      ]
    },
    {
      id: 'learn',
      title: 'Learning',
      icon: '📚',
      bookmarks: [
        { id: '6', title: 'Coursera', url: 'https://coursera.org' },
        { id: '7', title: 'Khan Academy', url: 'https://khanacademy.org' }
      ]
    },
    {
      id: 'finance',
      title: 'Finance',
      icon: '💰',
      bookmarks: [
        { id: '8', title: 'Yahoo Finance', url: 'https://finance.yahoo.com' },
        { id: '9', title: 'Bloomberg', url: 'https://bloomberg.com' }
      ]
    },
    {
      id: 'misc',
      title: 'Misc',
      icon: '💀',
      bookmarks: [
        { id: '10', title: 'Reddit', url: 'https://reddit.com' },
        { id: '11', title: 'Twitter', url: 'https://twitter.com' }
      ]
    }
  ],
  animations: {
    reducedMotion: false,
    parallax: true,
    glowEffects: true
  },
  theme: {
    extractColors: true,
    brightness: 1,
    saturation: 1
  }
};

function createSettingsStore() {
  const storedSettings = browser ? localStorage.getItem('startpage-settings') : null;
  const initialSettings = storedSettings ? JSON.parse(storedSettings) : defaultSettings;
  
  const { subscribe, set, update } = writable<Settings>(initialSettings);
  
  return {
    subscribe,
    update,
    reset: () => set(defaultSettings),
    save: (settings: Settings) => {
      set(settings);
      if (browser) {
        localStorage.setItem('startpage-settings', JSON.stringify(settings));
      }
    }
  };
}

export const settings = createSettingsStore();
