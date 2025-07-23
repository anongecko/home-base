<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  
  let show = true;
  let progress = 0;
  
  onMount(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        // Hide after a short delay
        setTimeout(() => {
          show = false;
        }, 400);
      }
    }, 100);
    
    // Force hide after max 2 seconds
    setTimeout(() => {
      show = false;
    }, 2000);
    
    return () => clearInterval(interval);
  });
</script>

{#if show}
  <div 
    class="loading-overlay"
    transition:fade={{ duration: 400 }}
  >
    <div class="loading-content">
      <div class="logo-container">
        <div class="logo-ring ring-1"></div>
        <div class="logo-ring ring-2"></div>
        <div class="logo-ring ring-3"></div>
        <div class="logo-core"></div>
      </div>
      
      <div class="progress-container">
        <div class="progress-bar">
          <div 
            class="progress-fill"
            style="width: {progress}%"
          ></div>
        </div>
      </div>
      
      <p class="loading-text">Initializing your experience...</p>
    </div>
  </div>
{/if}

<style>
  .loading-overlay {
    @apply fixed inset-0 z-50 flex items-center justify-center;
    background: radial-gradient(ellipse at center, #0a0a0a 0%, #000000 100%);
  }
  
  .loading-content {
    @apply flex flex-col items-center gap-8;
  }
  
  .logo-container {
    @apply relative w-32 h-32;
    transform-style: preserve-3d;
  }
  
  .logo-ring {
    @apply absolute inset-0 rounded-full border-2;
    animation: rotate 3s linear infinite;
  }
  
  .ring-1 {
    border-color: #ff0080;
    animation-duration: 3s;
  }
  
  .ring-2 {
    border-color: #00ff88;
    animation-duration: 4s;
    animation-direction: reverse;
    transform: scale(0.8);
  }
  
  .ring-3 {
    border-color: #00ffff;
    animation-duration: 5s;
    transform: scale(0.6);
  }
  
  .logo-core {
    @apply absolute inset-0 m-auto w-4 h-4 rounded-full;
    background: radial-gradient(circle, #ffffff 0%, #ff0080 100%);
    box-shadow: 0 0 40px #ff0080;
    animation: pulse 2s ease-in-out infinite;
  }
  
  @keyframes rotate {
    0% { transform: rotate(0deg) scale(var(--scale, 1)); }
    100% { transform: rotate(360deg) scale(var(--scale, 1)); }
  }
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.2); opacity: 0.8; }
  }
  
  .progress-container {
    @apply w-64;
  }
  
  .progress-bar {
    @apply h-1 bg-white/10 rounded-full overflow-hidden;
  }
  
  .progress-fill {
    @apply h-full rounded-full transition-all duration-300 ease-out;
    background: linear-gradient(90deg, #ff0080, #00ff88, #00ffff);
    box-shadow: 0 0 10px currentColor;
  }
  
  .loading-text {
    @apply text-sm text-white/60 animate-pulse;
    letter-spacing: 0.1em;
  }
</style>
