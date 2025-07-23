<script lang="ts">
  import { onMount } from 'svelte';
  import { theme } from '$lib/stores/theme';
  import { settings } from '$lib/stores/settings';
  
  export let count = 20;
  
  interface Particle {
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    opacity: number;
    hue: number;
    pulsePhase: number;
    orbitRadius: number;
    orbitSpeed: number;
  }
  
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  let particles: Particle[] = [];
  let animationFrame: number;
  let time = 0;
  let mouseX = 0;
  let mouseY = 0;
  let isMouseMoving = false;
  
  onMount(() => {
    ctx = canvas.getContext('2d', { alpha: true })!;
    
    // Set canvas size
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
    };
    resize();
    window.addEventListener('resize', resize);
    
    // Mouse tracking for interactive effects
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      isMouseMoving = true;
      setTimeout(() => isMouseMoving = false, 100);
    };
    window.addEventListener('mousemove', handleMouseMove);
    
    // Initialize particles
    initParticles();
    
    // Start animation
    if (!$settings.animations.reducedMotion) {
      animate();
    }
    
    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  });
  
  function initParticles() {
    particles = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * $settings.particleSpeed,
      vy: (Math.random() - 0.5) * $settings.particleSpeed,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.5 + 0.3,
      hue: Math.random() * 60 - 30,
      pulsePhase: Math.random() * Math.PI * 2,
      orbitRadius: Math.random() * 50 + 20,
      orbitSpeed: Math.random() * 0.02 + 0.01
    }));
  }
  
  function animate() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    time += 0.01;
    
    // Composite mode for better glow
    ctx.globalCompositeOperation = $settings.particleGlow ? 'screen' : 'source-over';
    
    particles.forEach(particle => {
      // Mouse interaction
      if (isMouseMoving) {
        const dx = mouseX - particle.x;
        const dy = mouseY - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 150) {
          const force = (150 - distance) / 150;
          particle.vx -= (dx / distance) * force * 0.5;
          particle.vy -= (dy / distance) * force * 0.5;
        }
      }
      
      // Orbital motion
      const orbitX = Math.cos(time * particle.orbitSpeed) * particle.orbitRadius * 0.1;
      const orbitY = Math.sin(time * particle.orbitSpeed * 1.3) * particle.orbitRadius * 0.1;
      
      // Update position
      particle.x += particle.vx + orbitX;
      particle.y += particle.vy + orbitY;
      
      // Damping
      particle.vx *= 0.99;
      particle.vy *= 0.99;
      
      // Restore original velocity
      if (Math.abs(particle.vx) < 0.1) {
        particle.vx = (Math.random() - 0.5) * $settings.particleSpeed;
      }
      if (Math.abs(particle.vy) < 0.1) {
        particle.vy = (Math.random() - 0.5) * $settings.particleSpeed;
      }
      
      // Wrap around edges smoothly
      const margin = particle.size * 4;
      if (particle.x < -margin) particle.x = window.innerWidth + margin;
      if (particle.x > window.innerWidth + margin) particle.x = -margin;
      if (particle.y < -margin) particle.y = window.innerHeight + margin;
      if (particle.y > window.innerHeight + margin) particle.y = -margin;
      
      // Pulsing
      const pulse = Math.sin(time * 2 + particle.pulsePhase) * 0.3 + 0.7;
      const currentOpacity = particle.opacity * pulse;
      
      // Draw particle
      const color = adjustHue($theme.primary, particle.hue);
      
      if ($settings.particleGlow && $settings.animations.glowEffects) {
        // Multi-layer glow effect
        for (let i = 3; i > 0; i--) {
          ctx.beginPath();
          const gradient = ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, particle.size * i * 2
          );
          gradient.addColorStop(0, `${color}${Math.floor(currentOpacity * 80 / i).toString(16).padStart(2, '0')}`);
          gradient.addColorStop(1, `${color}00`);
          ctx.fillStyle = gradient;
          ctx.arc(particle.x, particle.y, particle.size * i * 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      
      // Core particle
      ctx.beginPath();
      ctx.fillStyle = `${color}${Math.floor(currentOpacity * 255).toString(16).padStart(2, '0')}`;
      ctx.arc(particle.x, particle.y, particle.size * pulse, 0, Math.PI * 2);
      ctx.fill();
      
      // Connection lines when close
      if ($settings.animations.glowEffects) {
        particles.forEach(other => {
          if (other.id > particle.id) {
            const dx = other.x - particle.x;
            const dy = other.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 100) {
              ctx.beginPath();
              ctx.strokeStyle = `${color}${Math.floor((1 - distance / 100) * 30).toString(16).padStart(2, '0')}`;
              ctx.lineWidth = 0.5;
              ctx.moveTo(particle.x, particle.y);
              ctx.lineTo(other.x, other.y);
              ctx.stroke();
            }
          }
        });
      }
    });
    
    animationFrame = requestAnimationFrame(animate);
  }
  
  function adjustHue(hexColor: string, hueDelta: number): string {
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    
    // Convert RGB to HSL
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;
    
    const max = Math.max(rNorm, gNorm, bNorm);
    const min = Math.min(rNorm, gNorm, bNorm);
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case rNorm: h = ((gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0)) / 6; break;
        case gNorm: h = ((bNorm - rNorm) / d + 2) / 6; break;
        case bNorm: h = ((rNorm - gNorm) / d + 4) / 6; break;
      }
    }
    
    // Adjust hue and saturation
    h = (h * 360 + hueDelta) % 360 / 360;
    s = s * $settings.theme.saturation;
    
    // Convert back to RGB
    let r2, g2, b2;
    
    if (s === 0) {
      r2 = g2 = b2 = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r2 = hue2rgb(p, q, h + 1/3);
      g2 = hue2rgb(p, q, h);
      b2 = hue2rgb(p, q, h - 1/3);
    }
    
    // Apply brightness
    r2 *= $settings.theme.brightness;
    g2 *= $settings.theme.brightness;
    b2 *= $settings.theme.brightness;
    
    return `#${Math.round(Math.min(255, r2 * 255)).toString(16).padStart(2, '0')}${Math.round(Math.min(255, g2 * 255)).toString(16).padStart(2, '0')}${Math.round(Math.min(255, b2 * 255)).toString(16).padStart(2, '0')}`;
  }
  
  // Update particles reactively
  $: if (ctx && particles.length !== count) {
    if (particles.length < count) {
      const newParticles = Array.from({ length: count - particles.length }, (_, i) => ({
        id: particles.length + i,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * $settings.particleSpeed,
        vy: (Math.random() - 0.5) * $settings.particleSpeed,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.5 + 0.3,
        hue: Math.random() * 60 - 30,
        pulsePhase: Math.random() * Math.PI * 2,
        orbitRadius: Math.random() * 50 + 20,
        orbitSpeed: Math.random() * 0.02 + 0.01
      }));
      particles = [...particles, ...newParticles];
    } else {
      particles = particles.slice(0, count);
    }
  }
  
  // Update speed reactively
  $: if (particles.length > 0) {
    particles.forEach(p => {
      p.vx = (Math.random() - 0.5) * $settings.particleSpeed;
      p.vy = (Math.random() - 0.5) * $settings.particleSpeed;
    });
  }
</script>

<canvas 
  bind:this={canvas}
  class="fixed inset-0 pointer-events-none z-0"
  style="opacity: 0.8; mix-blend-mode: {$settings.particleGlow ? 'screen' : 'normal'};"
/>
