import { json } from '@sveltejs/kit';
import { readdir } from 'fs/promises';
import { join } from 'path';
import type { RequestHandler } from './$types';

// Cache for wallpaper lists
const wallpaperCache = new Map<string, { files: string[], timestamp: number }>();
const CACHE_DURATION = 60000; // 1 minute

export const GET: RequestHandler = async ({ url }) => {
  const folder = url.searchParams.get('folder') || 'nature';
  
  try {
    // Check cache first
    const cached = wallpaperCache.get(folder);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return json(cached.files);
    }
    
    const wallpaperPath = join(process.cwd(), 'static', 'wallpapers', folder);
    const files = await readdir(wallpaperPath);
    
    // Filter for image files
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png|webp|avif)$/i.test(file)
    );
    
    // Cache the result
    wallpaperCache.set(folder, {
      files: imageFiles,
      timestamp: Date.now()
    });
    
    // Clear old cache entries
    if (wallpaperCache.size > 10) {
      const oldestKey = Array.from(wallpaperCache.keys())[0];
      wallpaperCache.delete(oldestKey);
    }
    
    return json(imageFiles);
  } catch (error) {
    console.error('Error reading wallpapers:', error);
    return json([]);
  }
};
