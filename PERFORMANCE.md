# Performance Optimization Checklist

## 🚀 Pre-Deployment Checklist

### Images
- [ ] Run `pnpm optimize:images` to convert wallpapers to WebP
- [ ] Ensure 5K+ images (5376x3072) are under 3MB each
- [ ] Ensure 1080p images are under 500KB each
- [ ] Use mixed resolutions appropriately (5K for hero, 1080p for variety)
- [ ] Remove any animated GIFs (use static images only)
- [ ] Delete duplicate or similar wallpapers

### Build
- [ ] Use production build: `pnpm build:prod`
- [ ] Verify no console errors in production
- [ ] Test with Chrome DevTools Performance tab
- [ ] Check bundle size is under 200KB (excluding images)
- [ ] Enable source maps only for debugging

### Server
- [ ] Enable HTTP/2 on your web server
- [ ] Configure gzip/brotli compression
- [ ] Set proper cache headers for static assets
- [ ] Use CDN for wallpaper delivery (optional)
- [ ] Enable HTTPS for PWA and geolocation

## 📊 Performance Targets

### Core Web Vitals
- **LCP** (Largest Contentful Paint): <2.5s
- **FID** (First Input Delay): <100ms
- **CLS** (Cumulative Layout Shift): <0.1

### Custom Metrics
- **Wallpaper Load**: <500ms
- **Wallpaper Transition**: 400ms exact
- **Search Focus**: <50ms
- **Settings Open**: <100ms
- **Particle FPS**: 60 constant

## 🔧 Browser Settings

### Chrome/Edge Flags
Enable for best performance:
```
chrome://flags/#enable-gpu-rasterization
chrome://flags/#enable-zero-copy
chrome://flags/#enable-parallel-downloading
```

### Firefox Config
In `about:config`:
```
gfx.webrender.all = true
layers.acceleration.force-enabled = true
```

## 💾 Memory Optimization

### Current Memory Usage
- Base app: ~25MB
- Per 5K wallpaper cached: ~25-30MB
- Per 1080p wallpaper cached: ~5-10MB
- Particles system: ~5MB
- Total target: <150MB (adjusted for 5K)

### Optimization Tips
1. Limit wallpaper cache to 6 images for 5K content
2. Mix 1080p wallpapers to reduce memory pressure
3. Use WebP format (30-50% memory savings)
4. Reduce particle count on low-end devices
5. Clear old theme extraction data

## ⚡ Network Optimization

### Preloading Strategy
```javascript
// Current implementation preloads:
- Next 5 wallpapers
- Critical fonts
- Search engine icons
```

### Resource Hints
```html
<!-- Already implemented -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="dns-prefetch" href="https://api.openweathermap.org">
```

### Service Worker Caching
- Static assets: Cache forever
- Wallpapers: Cache with 30-day expiry
- API calls: Network first, cache fallback

## 🎨 Animation Performance

### GPU-Accelerated Properties
✅ Use these:
- `transform`
- `opacity`
- `filter`

❌ Avoid these:
- `width/height`
- `top/left`
- `margin/padding`

### Current Optimizations
```css
/* All animations use GPU-friendly properties */
.wallpaper-layer {
  will-change: opacity;
  transform: translateZ(0);
  backface-visibility: hidden;
}
```

## 📱 Mobile Optimization

### Touch Performance
- [ ] Disable hover effects on touch devices
- [ ] Use `passive` event listeners
- [ ] Implement `touch-action: manipulation`
- [ ] Reduce particle count to 10 on mobile

### Viewport Settings
```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
```

## 🔍 Monitoring

### Performance Testing Commands
```bash
# Run automated performance test
pnpm test:perf

# Manual testing with Lighthouse
pnpm dlx lighthouse http://localhost:5173 --view

# Bundle analysis
pnpm dlx vite-bundle-visualizer
```

### Key Metrics to Monitor
1. **Time to Interactive** (<3s)
2. **Total Blocking Time** (<300ms)
3. **Speed Index** (<3s)
4. **JavaScript execution time** (<2s)

## 🛠️ Debugging Performance

### Chrome DevTools
1. Performance tab → Record page load
2. Check for:
   - Long tasks (>50ms)
   - Layout thrashing
   - Forced reflows
   - Memory leaks

### Common Issues & Solutions

**Issue**: Janky wallpaper transitions
**Solution**: Ensure images are preloaded before transition

**Issue**: Sluggish particle animation
**Solution**: Reduce particle count or disable on low-end devices

**Issue**: Slow initial load
**Solution**: Enable service worker and HTTP/2 push

**Issue**: High memory usage
**Solution**: Limit wallpaper cache size, use WebP format

## 🎯 Performance Budget

### JavaScript
- Initial bundle: <100KB gzipped
- Lazy-loaded chunks: <50KB each

### CSS
- Critical CSS: <20KB
- Total CSS: <50KB

### Images
- Hero wallpaper (5K): <1MB WebP / <3MB JPEG
- Hero wallpaper (1080p): <300KB WebP / <500KB JPEG
- Subsequent wallpapers: Follow same limits
- Icons/UI: <10KB total

### Time Budget
- First Paint: <100ms
- First Contentful Paint: <200ms
- Time to Interactive: <500ms
- Full Load: <3s

## 🏆 Optimization Achievements

Track your optimization progress:

- [ ] All wallpapers converted to WebP
- [ ] Service Worker active and caching
- [ ] HTTP/2 enabled on server
- [ ] Compression enabled (gzip/brotli)
- [ ] Resource hints implemented
- [ ] Bundle size under 200KB
- [ ] All animations at 60fps
- [ ] Memory usage under 100MB
- [ ] Lighthouse score 95+

## 📈 Continuous Improvement

1. **Weekly**: Check performance metrics
2. **Monthly**: Update dependencies
3. **Quarterly**: Audit wallpaper collection
4. **Yearly**: Major performance review

Remember: *Performance is a feature!* ⚡
