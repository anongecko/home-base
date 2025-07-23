export interface ExtractedColors {
  primary: string;
  secondary: string;
  accent: string;
}

// Web Worker code as a string
const workerCode = `
  self.onmessage = function(e) {
    const { pixels, width, height } = e.data;
    const colorMap = new Map();
    const sampleRate = 10; // Sample every 10th pixel for speed
    
    for (let y = 0; y < height; y += sampleRate) {
      for (let x = 0; x < width; x += sampleRate) {
        const i = (y * width + x) * 4;
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        
        // Calculate HSL for better color analysis
        const hsl = rgbToHsl(r, g, b);
        
        // Skip very dark, very light, or low saturation colors
        if (hsl.l < 0.15 || hsl.l > 0.85 || hsl.s < 0.3) continue;
        
        const hex = rgbToHex(r, g, b);
        const score = hsl.s * (0.5 + 0.5 * Math.abs(0.5 - hsl.l)); // Favor vibrant mid-tones
        
        colorMap.set(hex, (colorMap.get(hex) || 0) + score);
      }
    }
    
    // Get top colors by score
    const sortedColors = Array.from(colorMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([color]) => color);
    
    self.postMessage(sortedColors);
  };
  
  function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    
    return { h, s, l };
  }
  
  function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
  }
`;

let worker: Worker | null = null;

function getWorker(): Worker {
  if (!worker) {
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    worker = new Worker(workerUrl);
  }
  return worker;
}

export async function extractColors(imageUrl: string): Promise<ExtractedColors> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        
        if (!ctx) {
          throw new Error('Could not get canvas context');
        }
        
        // Use smaller size for faster processing (especially for 5K+ images)
        const maxDimension = 150; // Reduced from 200 for better performance
        const scale = Math.min(maxDimension / img.width, maxDimension / img.height);
        
        canvas.width = Math.floor(img.width * scale);
        canvas.height = Math.floor(img.height * scale);
        
        // Use better image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // Process in Web Worker
        const worker = getWorker();
        
        worker.onmessage = (e) => {
          const colors = getDiverseColors(e.data, 3);
          
          resolve({
            primary: colors[0] || '#ff0080',
            secondary: colors[1] || '#00ff88',
            accent: colors[2] || '#00ffff'
          });
        };
        
        worker.postMessage({
          pixels: imageData.data,
          width: canvas.width,
          height: canvas.height
        });
        
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageUrl;
  });
}

function getDiverseColors(colors: string[], count: number): string[] {
  if (colors.length <= count) return colors;
  
  const selected: string[] = [colors[0]];
  const minDistance = 60; // Minimum color distance
  
  for (const candidate of colors) {
    if (selected.length >= count) break;
    
    let isDiverse = true;
    for (const selectedColor of selected) {
      if (colorDistance(candidate, selectedColor) < minDistance) {
        isDiverse = false;
        break;
      }
    }
    
    if (isDiverse) {
      selected.push(candidate);
    }
  }
  
  // Fill with defaults if needed
  while (selected.length < count) {
    selected.push(['#ff0080', '#00ff88', '#00ffff'][selected.length]);
  }
  
  return selected;
}

function colorDistance(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  
  if (!rgb1 || !rgb2) return 0;
  
  // Use weighted Euclidean distance (human eye is more sensitive to green)
  return Math.sqrt(
    2 * Math.pow(rgb1.r - rgb2.r, 2) +
    4 * Math.pow(rgb1.g - rgb2.g, 2) +
    3 * Math.pow(rgb1.b - rgb2.b, 2)
  );
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}
