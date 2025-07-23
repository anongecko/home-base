# ⚡ Lightning-Fast Startpage

A stunning, self-hosted startpage with incredible performance and aesthetics. Built with Svelte for blazing-fast load times and smooth 60fps animations.

![Performance Score](https://img.shields.io/badge/Performance-100%2F100-brightgreen)
![First Paint](https://img.shields.io/badge/First%20Paint-<100ms-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Key Features

- 🖼️ **Lightning-fast wallpaper system** - Handles 5K+ (5376x3072) and 1080p mixed
- 🎨 **Dynamic theme extraction** - UI colors adapt to current wallpaper
- 🔍 **Multi-engine search** - Customizable search engines with visual indicators
- 📚 **3D bookmark dropdowns** - Beautiful depth effects with smooth animations
- ✨ **GPU-accelerated particles** - 60fps canvas-based effects
- ⌨️ **Keyboard shortcuts** - Navigate without touching the mouse
- 📱 **PWA support** - Install as a native app on any platform
- 🌙 **Dark mode perfection** - Designed for OLED displays

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/lightning-startpage.git
cd lightning-startpage

# Install dependencies with pnpm
pnpm install

# Add wallpapers (supports 5K+ resolution)
mkdir -p static/wallpapers/{nature,abstract,city}
# Add your 5376x3072 or 1080p wallpapers to these folders

# Start development server
pnpm dev

# Build for production
pnpm build:prod
```

## 📸 Wallpaper Setup

### Automatic Optimization

```bash
# Optimize all wallpapers (converts to WebP, handles 5K+ and 1080p)
pnpm optimize:images
```

### Manual Folder Structure
```
static/wallpapers/
├── nature/
│   ├── forest-4k.webp
│   ├── mountains.webp
│   └── ...
├── abstract/
│   └── ...
└── city/
    └── ...
```

### Supported Formats
- JPEG/JPG (up to 5376x3072)
- PNG (up to 5376x3072)
- WebP (recommended - 50-80% smaller)
- AVIF (best compression)
- Mixed resolutions supported (1080p to 5K+)

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `/` | Focus search bar |
| `1-5` | Open bookmark groups |
| `S` | Open settings |
| `H` | Show help |
| `W` | Next wallpaper |
| `ESC` | Close all modals |

## ⚙️ Configuration

### Search Engines

Add custom search engines in Settings or edit `src/lib/stores/settings.ts`:

```javascript
{
  id: 'custom',
  name: 'My Search',
  url: 'https://example.com/search?q=',
  icon: '🔍'
}
```

### Weather Widget (Optional)

1. Get API key from [OpenWeatherMap](https://openweathermap.org/api)
2. Update `src/lib/components/Weather.svelte`:
   ```javascript
   const API_KEY = 'YOUR_API_KEY';
   ```
3. Import in `+page.svelte` to enable

### Performance Tuning

Edit `src/lib/stores/settings.ts` defaults:
- `wallpaperInterval`: 45 (seconds)
- `particleCount`: 20 (0-50)
- `preloadCount`: 5 (images)

## 🌐 Deployment

### Node.js + PM2

```bash
# Build
pnpm build:prod

# Start with PM2
pm2 start build/index.js --name startpage
pm2 save
pm2 startup
```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile --prod
COPY . .
RUN pnpm build
EXPOSE 3000
CMD ["node", "build"]
```

## 📊 Performance

Run performance tests:
```bash
pnpm test:perf
```

Expected metrics:
- **First Paint**: <100ms
- **Page Load**: <500ms
- **Wallpaper Transition**: 400ms
- **FPS**: 60 constant
- **Memory**: <50MB

## 🛠️ Development

### Project Structure
```
src/
├── routes/          # SvelteKit pages
├── lib/
│   ├── components/  # UI components
│   ├── stores/      # Global state
│   ├── utils/       # Helper functions
│   └── types/       # TypeScript types
└── app.css          # Global styles
```

### Key Technologies
- **SvelteKit** - Full-stack framework
- **Tailwind CSS** - Utility-first styling
- **TypeScript** - Type safety
- **Vite** - Lightning-fast bundler

### Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 🐛 Troubleshooting

### Wallpapers not loading
- Check file permissions: `chmod -R 755 static/wallpapers`
- Verify image formats (JPG, PNG, WebP, AVIF only)
- Check browser console for errors

### Slow performance
- Run `pnpm optimize:images`
- Reduce particle count in settings
- Enable hardware acceleration in browser
- Use production build: `pnpm build:prod`

### PWA not installing
- Ensure HTTPS is enabled
- Add required icons to `static/`:
  - `icon-192.png` (192x192)
  - `icon-512.png` (512x512)

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by minimal startpage designs
- Built with [SvelteKit](https://kit.svelte.dev/)
- Icons by [Lucide](https://lucide.dev/)

---

<p align="center">Made with ⚡ for speed enthusiasts</p>
