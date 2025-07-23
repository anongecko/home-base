import puppeteer from 'puppeteer';

async function measurePerformance() {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  // Enable performance monitoring
  await page.evaluateOnNewDocument(() => {
    window.performanceMetrics = {
      wallpaperLoads: [],
      searchInteractions: [],
      animationFrames: []
    };
    
    // Monitor wallpaper loads
    const originalDrawImage = CanvasRenderingContext2D.prototype.drawImage;
    CanvasRenderingContext2D.prototype.drawImage = function(...args) {
      const start = performance.now();
      originalDrawImage.apply(this, args);
      window.performanceMetrics.wallpaperLoads.push(performance.now() - start);
    };
    
    // Monitor animation frames
    let frameCount = 0;
    let lastTime = performance.now();
    function measureFrames() {
      frameCount++;
      const now = performance.now();
      if (now - lastTime >= 1000) {
        window.performanceMetrics.animationFrames.push(frameCount);
        frameCount = 0;
        lastTime = now;
      }
      requestAnimationFrame(measureFrames);
    }
    requestAnimationFrame(measureFrames);
  });
  
  console.log('🚀 Starting performance test...\n');
  
  // Navigate to the page
  const startTime = Date.now();
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
  
  // Get performance metrics
  const metrics = await page.metrics();
  const performanceTiming = JSON.parse(
    await page.evaluate(() => JSON.stringify(window.performance.timing))
  );
  
  // Calculate key metrics
  const pageLoadTime = performanceTiming.loadEventEnd - performanceTiming.navigationStart;
  const domContentLoaded = performanceTiming.domContentLoadedEventEnd - performanceTiming.navigationStart;
  const firstPaint = await page.evaluate(() => {
    const paintEntries = performance.getEntriesByType('paint');
    return paintEntries.find(entry => entry.name === 'first-paint')?.startTime || 0;
  });
  
  console.log('📊 Performance Metrics:');
  console.log(`├─ First Paint: ${firstPaint.toFixed(2)}ms`);
  console.log(`├─ DOM Content Loaded: ${domContentLoaded}ms`);
  console.log(`├─ Page Load Time: ${pageLoadTime}ms`);
  console.log(`├─ JS Heap Size: ${(metrics.JSHeapUsedSize / 1024 / 1024).toFixed(2)}MB`);
  console.log(`└─ DOM Nodes: ${metrics.Nodes}\n`);
  
  // Test wallpaper transitions
  console.log('🖼️  Testing wallpaper transitions...');
  await page.waitForTimeout(2000); // Wait for initial load
  
  // Measure 5 wallpaper transitions
  const transitionTimes = [];
  for (let i = 0; i < 5; i++) {
    const start = Date.now();
    
    // Wait for transition by monitoring DOM changes
    await page.evaluate(() => {
      return new Promise(resolve => {
        const observer = new MutationObserver(() => {
          observer.disconnect();
          resolve();
        });
        observer.observe(document.body, { 
          childList: true, 
          subtree: true, 
          attributes: true 
        });
      });
    });
    
    transitionTimes.push(Date.now() - start);
    await page.waitForTimeout(1000);
  }
  
  const avgTransition = transitionTimes.reduce((a, b) => a + b, 0) / transitionTimes.length;
  console.log(`├─ Average transition time: ${avgTransition.toFixed(2)}ms`);
  console.log(`└─ All transitions: ${transitionTimes.map(t => t + 'ms').join(', ')}\n`);
  
  // Test search interaction
  console.log('🔍 Testing search interaction...');
  const searchInput = await page.$('input[placeholder="Search the web..."]');
  
  const inputStart = Date.now();
  await searchInput.focus();
  const focusTime = Date.now() - inputStart;
  
  const typeStart = Date.now();
  await searchInput.type('test query', { delay: 50 });
  const typeTime = Date.now() - typeStart;
  
  console.log(`├─ Focus response: ${focusTime}ms`);
  console.log(`└─ Typing response: ${typeTime}ms\n`);
  
  // Get custom performance metrics
  const customMetrics = await page.evaluate(() => window.performanceMetrics);
  
  if (customMetrics.animationFrames.length > 0) {
    const avgFPS = customMetrics.animationFrames.reduce((a, b) => a + b, 0) / customMetrics.animationFrames.length;
    console.log(`🎮 Animation Performance:`);
    console.log(`└─ Average FPS: ${avgFPS.toFixed(1)}\n`);
  }
  
  // Resource loading
  const resources = await page.evaluate(() => 
    performance.getEntriesByType('resource').map(r => ({
      name: r.name.split('/').pop(),
      duration: r.duration,
      size: r.transferSize
    }))
  );
  
  const images = resources.filter(r => r.name.match(/\.(jpg|jpeg|png|webp|avif)$/i));
  console.log(`📦 Resource Loading:`);
  console.log(`├─ Total resources: ${resources.length}`);
  console.log(`├─ Images loaded: ${images.length}`);
  if (images.length > 0) {
    const avgImageLoad = images.reduce((a, b) => a + b.duration, 0) / images.length;
    console.log(`└─ Average image load time: ${avgImageLoad.toFixed(2)}ms\n`);
  }
  
  // Final score
  const score = calculateScore({
    firstPaint,
    pageLoadTime,
    avgTransition,
    focusTime
  });
  
  console.log(`🏆 Performance Score: ${score}/100`);
  console.log(getScoreEmoji(score));
  
  await browser.close();
}

function calculateScore(metrics) {
  let score = 100;
  
  // Deduct points based on thresholds
  if (metrics.firstPaint > 100) score -= Math.min(20, (metrics.firstPaint - 100) / 10);
  if (metrics.pageLoadTime > 1000) score -= Math.min(20, (metrics.pageLoadTime - 1000) / 50);
  if (metrics.avgTransition > 500) score -= Math.min(20, (metrics.avgTransition - 500) / 25);
  if (metrics.focusTime > 50) score -= Math.min(10, (metrics.focusTime - 50) / 5);
  
  return Math.max(0, Math.round(score));
}

function getScoreEmoji(score) {
  if (score >= 90) return '⚡ Lightning fast!';
  if (score >= 80) return '🚀 Very fast!';
  if (score >= 70) return '✨ Fast';
  if (score >= 60) return '👍 Good';
  return '🐌 Needs optimization';
}

// Run the test
measurePerformance().catch(console.error);
