import sharp from 'sharp';
import { readdir, mkdir, stat } from 'fs/promises';
import { join, parse } from 'path';
import { existsSync } from 'fs';

const WALLPAPER_DIR = './static/wallpapers';
const QUALITY = 85;
const MAX_WIDTH = 5376; // 5K+ width support
const MAX_HEIGHT = 3072; // 5K+ height support
const MIN_WIDTH = 1920; // Don't upscale 1080p images

async function optimizeImages() {
  console.log('🖼️  Starting wallpaper optimization...');
  console.log(`📐 Max dimensions: ${MAX_WIDTH}x${MAX_HEIGHT} (5K+)`);
  console.log(`📏 Min width: ${MIN_WIDTH} (no upscaling below this)\n`);
  
  try {
    const folders = await readdir(WALLPAPER_DIR);
    let totalOriginalSize = 0;
    let totalOptimizedSize = 0;
    let imageCount = 0;
    
    for (const folder of folders) {
      const folderPath = join(WALLPAPER_DIR, folder);
      const folderStat = await stat(folderPath);
      
      if (!folderStat.isDirectory()) continue;
      
      console.log(`📁 Processing folder: ${folder}`);
      
      // Create optimized folder
      const optimizedPath = join(folderPath, 'optimized');
      if (!existsSync(optimizedPath)) {
        await mkdir(optimizedPath, { recursive: true });
      }
      
      const files = await readdir(folderPath);
      const imageFiles = files.filter(file => 
        /\.(jpg|jpeg|png|webp)$/i.test(file) && !file.startsWith('.')
      );
      
      for (const file of imageFiles) {
        const inputPath = join(folderPath, file);
        const { name } = parse(file);
        const outputPath = join(optimizedPath, `${name}.webp`);
        
        // Skip if already optimized
        if (existsSync(outputPath)) {
          console.log(`  ⏭️  Skipping ${file} (already optimized)`);
          continue;
        }
        
        try {
          // Get original file size
          const originalStats = await stat(inputPath);
          totalOriginalSize += originalStats.size;
          
          // Process image
          const image = sharp(inputPath);
          const metadata = await image.metadata();
          
          // Calculate resize dimensions (only downscale, never upscale)
          let width = metadata.width;
          let height = metadata.height;
          
          // Only resize if image is larger than max dimensions
          if (width > MAX_WIDTH || height > MAX_HEIGHT) {
            const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
            console.log(`  📐 Resizing from ${metadata.width}x${metadata.height} to ${width}x${height}`);
          } else if (width < MIN_WIDTH) {
            console.log(`  📏 Keeping original size ${width}x${height} (no upscaling)`);
          }
          
          // Optimize and convert to WebP
          await image
            .resize(width, height, {
              fit: 'inside',
              withoutEnlargement: true, // Never upscale
              kernel: sharp.kernel.lanczos3
            })
            .webp({
              quality: QUALITY,
              effort: 6, // Higher effort for better compression
              smartSubsample: true,
              preset: 'photo'
            })
            .toFile(outputPath);
          
          // Get optimized file size
          const optimizedStats = await stat(outputPath);
          totalOptimizedSize += optimizedStats.size;
          imageCount++;
          
          const reduction = ((1 - optimizedStats.size / originalStats.size) * 100).toFixed(1);
          console.log(`  ✅ ${file} → ${name}.webp (${reduction}% smaller)`);
          
        } catch (error) {
          console.error(`  ❌ Failed to optimize ${file}:`, error.message);
        }
      }
      
      console.log('');
    }
    
    // Summary
    if (imageCount > 0) {
      const totalReduction = ((1 - totalOptimizedSize / totalOriginalSize) * 100).toFixed(1);
      console.log('📊 Optimization Summary:');
      console.log(`├─ Images processed: ${imageCount}`);
      console.log(`├─ Original size: ${formatBytes(totalOriginalSize)}`);
      console.log(`├─ Optimized size: ${formatBytes(totalOptimizedSize)}`);
      console.log(`└─ Total reduction: ${totalReduction}%\n`);
      
      console.log('💡 Tips:');
      console.log('1. Move optimized images to replace originals when ready');
      console.log('2. Update your wallpaper folders to use the .webp files');
      console.log('3. Keep originals as backup if needed');
    } else {
      console.log('ℹ️  No images needed optimization.');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Run optimization
optimizeImages();
