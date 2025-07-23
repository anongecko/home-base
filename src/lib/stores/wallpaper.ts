import { writable, derived } from 'svelte/store';
import { settings } from './settings';

interface WallpaperState {
  current: string;
  next: string;
  available: string[];
  isTransitioning: boolean;
  preloadedImages: Map<string, HTMLImageElement>;
  currentIndex: number;
}

const PRELOAD_COUNT = 3; // Reduced for 5K+ images
const CACHE_SIZE = 6; // Reduced cache for larger images

function createWallpaperStore() {
  const { subscribe, set, update } = writable<WallpaperState>({
    current: '',
    next: '',
    available: [],
    isTransitioning: false,
    preloadedImages: new Map(),
    currentIndex: 0
  });
  
  let interval: NodeJS.Timeout | null = null;
  let imageCache = new Map<string, HTMLImageElement>();
  let loadingPromises = new Map<string, Promise<void>>();
  
  // Preload image with caching
  async function preloadImage(url: string): Promise<HTMLImageElement> {
    // Return cached image if available
    if (imageCache.has(url)) {
      return imageCache.get(url)!;
    }
    
    // Return existing loading promise if in progress
    if (loadingPromises.has(url)) {
      await loadingPromises.get(url);
      return imageCache.get(url)!;
    }
    
    // Create loading promise
    const loadPromise = new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        imageCache.set(url, img);
        
        // Manage cache size
        if (imageCache.size > CACHE_SIZE) {
          const firstKey = imageCache.keys().next().value;
          imageCache.delete(firstKey);
        }
        
        loadingPromises.delete(url);
        resolve();
      };
      
      img.onerror = () => {
        loadingPromises.delete(url);
        reject(new Error(`Failed to load image: ${url}`));
      };
      
      // High priority loading
      img.fetchPriority = 'high';
      img.decoding = 'async';
      img.src = url;
    });
    
    loadingPromises.set(url, loadPromise);
    await loadPromise;
    return imageCache.get(url)!;
  }
  
  // Preload multiple images ahead
  async function preloadNextImages(folder: string, wallpapers: string[], startIndex: number) {
    const preloadPromises = [];
    
    for (let i = 0; i < PRELOAD_COUNT; i++) {
      const index = (startIndex + i) % wallpapers.length;
      const url = `/wallpapers/${folder}/${wallpapers[index]}`;
      preloadPromises.push(preloadImage(url));
    }
    
    await Promise.allSettled(preloadPromises);
  }
  
  async function loadWallpapers(folder: string) {
    try {
      const response = await fetch(`/api/wallpapers?folder=${folder}`);
      const wallpapers = await response.json();
      
      if (wallpapers.length > 0) {
        // Shuffle wallpapers for variety
        const shuffled = [...wallpapers].sort(() => Math.random() - 0.5);
        
        // Load first image immediately
        const firstUrl = `/wallpapers/${folder}/${shuffled[0]}`;
        await preloadImage(firstUrl);
        
        update(state => ({
          ...state,
          available: shuffled,
          current: firstUrl,
          currentIndex: 0,
          next: ''
        }));
        
        // Start preloading next images
        preloadNextImages(folder, shuffled, 1);
      }
    } catch (error) {
      console.error('Failed to load wallpapers:', error);
    }
  }
  
  function startRotation(folder: string, intervalSeconds: number) {
    stopRotation();
    
    interval = setInterval(() => {
      update(state => {
        if (state.available.length <= 1) return state;
        
        const nextIndex = (state.currentIndex + 1) % state.available.length;
        const nextUrl = `/wallpapers/${folder}/${state.available[nextIndex]}`;
        
        // Start preloading more images
        const preloadStartIndex = (nextIndex + 1) % state.available.length;
        preloadNextImages(folder, state.available, preloadStartIndex);
        
        return {
          ...state,
          next: nextUrl,
          isTransitioning: true,
          currentIndex: nextIndex
        };
      });
      
      // Complete transition with shorter duration for snappiness
      setTimeout(() => {
        update(state => ({
          ...state,
          current: state.next,
          next: '',
          isTransitioning: false
        }));
      }, 400);
    }, intervalSeconds * 1000);
  }
  
  function stopRotation() {
    if (interval) {
      clearInterval(interval);
      interval = null;
    }
  }
  
  function forceTransition(url: string, index: number) {
    update(state => ({
      ...state,
      next: url,
      isTransitioning: true,
      currentIndex: index
    }));
    
    setTimeout(() => {
      update(state => ({
        ...state,
        current: state.next,
        next: '',
        isTransitioning: false
      }));
    }, 400);
  }
  
  // Cleanup on destroy
  function cleanup() {
    stopRotation();
    imageCache.clear();
    loadingPromises.clear();
  }
  
  return {
    subscribe,
    loadWallpapers,
    startRotation,
    stopRotation,
    forceTransition,
    cleanup,
    getPreloadedImage: (url: string) => imageCache.get(url)
  };
}

export const wallpaper = createWallpaperStore();
