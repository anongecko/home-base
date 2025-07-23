<script lang="ts">
  import { wallpaper } from '$lib/stores/wallpaper';
  import { settings } from '$lib/stores/settings';
  import { onDestroy } from 'svelte';
  import { fade, blur, scale, fly } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  
  // Cleanup on component destroy
  onDestroy(() => {
    wallpaper.cleanup();
  });
  
  // Get transition function based on settings
  function getTransition(type: string) {
    switch (type) {
      case 'slide':
        return { fn: fly, options: { x: -50, duration: 600, easing: cubicOut } };
      case 'zoom':
        return { fn: scale, options: { start: 1.1, duration: 600, easing: cubicOut } };
      case 'blur':
        return { fn: blur, options: { amount: 10, duration: 600 } };
      default:
        return { fn: fade, options: { duration: 400 } };
    }
  }
  
  $: transition = getTransition($settings.wallpaperTransition);
  $: blurAmount = $settings.wallpaperBlur;
</script>

<div class="fixed inset-0">
  <!-- Current Wallpaper -->
  {#if $wallpaper.current}
    <div 
      class="absolute inset-0 wallpaper-layer"
      style="
        background-image: url('{$wallpaper.current}');
        filter: blur({blurAmount}px) brightness({$settings.theme.brightness}) saturate({$settings.theme.saturation});
        opacity: {$wallpaper.isTransitioning ? 0 : 1};
      "
    />
  {/if}
  
  <!-- Next Wallpaper (for transition) -->
  {#if $wallpaper.next && $wallpaper.isTransitioning}
    <div 
      class="absolute inset-0 wallpaper-layer"
      style="
        background-image: url('{$wallpaper.next}');
        filter: blur({blurAmount}px) brightness({$settings.theme.brightness}) saturate({$settings.theme.saturation});
      "
      in:transition.fn={transition.options}
    />
  {/if}
  
  <!-- Parallax overlay effect -->
  {#if $settings.animations.parallax}
    <div class="absolute inset-0 parallax-overlay" />
  {/if}
  
  <!-- Enhanced gradient overlay -->
  <div class="absolute inset-0 gradient-overlay" />
</div>

<style>
  .wallpaper-layer {
    @apply bg-cover bg-center bg-no-repeat;
    will-change: opacity, filter, transform;
    transform: translateZ(0);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
    transition: opacity 400ms cubic-bezier(0.4, 0, 0.2, 1), 
                filter 600ms cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .parallax-overlay {
    background-image: 
      radial-gradient(ellipse at top, transparent 0%, rgba(0,0,0,0.2) 100%),
      radial-gradient(ellipse at bottom, rgba(0,0,0,0.4) 0%, transparent 100%);
    transform: translateZ(-1px) scale(1.1);
    will-change: transform;
  }
  
  .gradient-overlay {
    background: 
      linear-gradient(
        to bottom,
        rgba(0,0,0,0.1) 0%,
        transparent 20%,
        transparent 80%,
        rgba(0,0,0,0.3) 100%
      );
    pointer-events: none;
  }
  
  @media (prefers-reduced-motion: reduce) {
    .wallpaper-layer {
      transition: none !important;
    }
  }
</style>
