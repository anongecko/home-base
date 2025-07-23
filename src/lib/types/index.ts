export interface SearchEngine {
  id: string;
  name: string;
  url: string;
  icon?: string;
}

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  icon?: string;
}

export interface BookmarkGroup {
  id: string;
  title: string;
  icon: string;
  bookmarks: Bookmark[];
}

export interface Settings {
  wallpaperFolder: string;
  wallpaperInterval: number; // seconds
  wallpaperTransition: 'fade' | 'slide' | 'zoom' | 'blur';
  wallpaperBlur: number; // 0-20
  particleCount: number;
  particleSpeed: number; // 0.1-2
  particleGlow: boolean;
  searchEngines: SearchEngine[];
  defaultSearchEngine: string;
  bookmarkGroups: BookmarkGroup[];
  animations: {
    reducedMotion: boolean;
    parallax: boolean;
    glowEffects: boolean;
  };
  theme: {
    extractColors: boolean;
    customPrimary?: string;
    customSecondary?: string;
    customAccent?: string;
    brightness: number; // 0.5-1.5
    saturation: number; // 0.5-1.5
  };
}

export interface Theme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}
