# Configuration Guide

## Weather Widget Setup

To enable the weather widget, you'll need an OpenWeatherMap API key:

1. Sign up at [OpenWeatherMap](https://openweathermap.org/api)
2. Get your free API key
3. Update `src/lib/components/Weather.svelte`:
   ```javascript
   const API_KEY = 'YOUR_ACTUAL_API_KEY_HERE';
   ```
4. Add the Weather component to `src/routes/+page.svelte`:
   ```svelte
   import Weather from '$lib/components/Weather.svelte';
   
   <!-- Add after the Particles component -->
   <Weather />
   ```

## Wallpaper Setup

### Folder Structure
```
static/wallpapers/
├── nature/
│   ├── forest-5k.jpg      # 5376x3072
│   ├── mountains-1080p.jpg # 1920x1080 
│   ├── lake.webp          # Already optimized
│   └── ...
├── asian-beauty/
│   └── ...
└── abstract/
    └── ...
```

### Optimizing Wallpapers

For best performance with mixed resolution wallpapers (1080p to 5K+):

```bash
# Install dependencies
pnpm install

# Run optimization script
pnpm optimize:images
```

This will:
- Convert images to WebP format (50-80% smaller)
- Preserve 5K+ resolution (5376x3072 max)
- Keep 1080p images at original size (no upscaling)
- Create optimized versions in `optimized/` subfolder

### Manual Optimization

Using `cwebp` (Google's WebP converter):
```bash
# Install cwebp
brew install webp  # macOS
sudo apt-get install webp  # Ubuntu/Debian

# Convert single image
cwebp -q 85 input.jpg -o output.webp

# Batch convert
for f in *.jpg; do cwebp -q 85 "$f" -o "${f%.jpg}.webp"; done
```

## Search Engines

Add custom search engines in Settings or edit `src/lib/stores/settings.ts`:

```javascript
searchEngines: [
  {
    id: 'custom',
    name: 'My Search',
    url: 'https://example.com/search?q=',
    icon: '🔍'
  }
]
```

## Keyboard Shortcuts

Default shortcuts (customizable in `src/lib/components/KeyboardShortcuts.svelte`):

- `/` - Focus search bar
- `1-5` - Open bookmark groups
- `S` - Open settings
- `H` - Show keyboard help
- `W` - Next wallpaper
- `ESC` - Close all modals

## Performance Tuning

### Nginx Configuration

For production deployment, use the provided `nginx.conf`:

```bash
# Copy to nginx sites-available
sudo cp nginx.conf /etc/nginx/sites-available/startpage
sudo ln -s /etc/nginx/sites-available/startpage /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### Service Worker

The service worker automatically caches:
- All static assets
- Wallpaper images (cache-first strategy)
- API responses (network-first strategy)

Clear cache by updating version in `package.json`.

### Browser Settings

For best experience:
1. Set as browser homepage
2. Enable "Preload pages" in Chrome/Edge
3. Allow location access for weather
4. Pin as PWA for instant access

## Customization

### Theme Colors

Colors automatically adapt to wallpapers. Override in `src/lib/stores/theme.ts`:

```javascript
const defaultTheme: Theme = {
  primary: '#ff0080',
  secondary: '#00ff88',
  accent: '#00ffff',
  background: 'rgba(0, 0, 0, 0.5)',
  text: '#ffffff'
};
```

### Particles

Adjust particle behavior in `src/lib/components/Particles.svelte`:

```javascript
// Particle speed
vx: (Math.random() - 0.5) * 0.5,  // Horizontal speed
vy: (Math.random() - 0.5) * 0.5,  // Vertical speed

// Particle size
size: Math.random() * 3 + 1,  // 1-4px

// Particle glow
particle.size * 4  // Glow radius
```

### Clock Format

Edit `src/lib/components/Clock.svelte`:

```javascript
let showSeconds = true;  // Show seconds
let use24Hour = false;   // 12-hour format
```

## Troubleshooting

### Wallpapers not loading
- Check file permissions: `chmod -R 755 static/wallpapers`
- Verify image formats: JPG, PNG, WebP, AVIF only
- Check browser console for errors

### Slow performance
- Run `npm run optimize:images`
- Reduce particle count in settings
- Use WebP format for wallpapers
- Enable hardware acceleration in browser

### Weather not working
- Verify API key is correct
- Check browser location permissions
- Ensure HTTPS is enabled (required for geolocation)

### PWA not installing
- Ensure HTTPS is enabled
- Add icons to `static/` folder:
  - `icon-192.png` (192x192)
  - `icon-512.png` (512x512)
