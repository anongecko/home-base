<script lang="ts">
  import { onMount } from 'svelte';
  import SearchBar from '$lib/components/SearchBar.svelte';
  import BookmarkDropdown from '$lib/components/BookmarkDropdown.svelte';
  import Settings from '$lib/components/Settings.svelte';
  import Particles from '$lib/components/Particles.svelte';
  import WallpaperManager from '$lib/components/WallpaperManager.svelte';
  import { settings } from '$lib/stores/settings';
  import { wallpaper } from '$lib/stores/wallpaper';
  import { theme } from '$lib/stores/theme';
  import { Cog } from 'lucide-svelte';
  import Clock from '$lib/components/Clock.svelte';
  import KeyboardShortcuts from '$lib/components/KeyboardShortcuts.svelte';
  import LoadingAnimation from '$lib/components/LoadingAnimation.svelte';
  
  let showSettings = false;
  let searchBarComponent: SearchBar;
  let bookmarkDropdowns: BookmarkDropdown[] = [];
  
  function handleKeyboardShortcut(event: CustomEvent) {
    switch (event.type) {
      case 'focusSearch':
        searchBarComponent?.focus();
        break;
        
      case 'openBookmark':
        const index = event.detail.index;
        if (bookmarkDropdowns[index]) {
          bookmarkDropdowns[index].toggle();
        }
        break;
        
      case 'openSettings':
        showSettings = true;
        break;
        
      case 'nextWallpaper':
        // Force next wallpaper
        const currentState = $wallpaper;
        if (currentState.available.length > 1) {
          const nextIndex = (currentState.currentIndex + 1) % currentState.available.length;
          const nextUrl = `/wallpapers/${$settings.wallpaperFolder}/${currentState.available[nextIndex]}`;
          wallpaper.forceTransition(nextUrl, nextIndex);
        }
        break;
        
      case 'closeAll':
        showSettings = false;
        bookmarkDropdowns.forEach(dd => dd?.close());
        break;
    }
  }
  
  onMount(() => {
    // Initialize wallpaper system
    const unsubscribe = settings.subscribe(async ($settings) => {
      await wallpaper.loadWallpapers($settings.wallpaperFolder);
      wallpaper.startRotation($settings.wallpaperFolder, $settings.wallpaperInterval);
    });
    
    // Update theme when wallpaper changes
    const wallpaperUnsub = wallpaper.subscribe(($wallpaper) => {
      if ($wallpaper.current) {
        theme.updateFromWallpaper($wallpaper.current);
      }
    });
    
    return () => {
      unsubscribe();
      wallpaperUnsub();
      wallpaper.stopRotation();
    };
  });
</script>

<div class="relative w-screen h-screen overflow-hidden">
  <!-- Loading Animation -->
  <LoadingAnimation />
  
  <!-- Wallpaper Background -->
  <WallpaperManager />
  
  <!-- Particles -->
  <Particles count={$settings.particleCount} />
  
  <!-- Main Content -->
  <div class="relative z-10 flex flex-col items-center justify-center h-full px-8">
    <!-- Settings Button -->
    <button
      on:click={() => showSettings = true}
      class="absolute top-8 right-8 p-3 glass-button rounded-full group hover-glow"
      aria-label="Settings"
      style="animation: fade-in-down 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s both"
    >
      <Cog 
        size={24} 
        class="transition-transform duration-300 group-hover:rotate-90"
        style="color: {$theme.text}"
      />
    </button>
    
    <!-- Clock -->
    <Clock />
    
    <!-- Search Bar -->
    <div 
      class="w-full max-w-2xl mb-16"
      style="animation: fade-in-up 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both"
    >
      <SearchBar bind:this={searchBarComponent} />
    </div>
    
    <!-- Bookmark Groups -->
    <div class="flex gap-8">
      {#each $settings.bookmarkGroups as group, i}
        <div style="animation: fade-in-up 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) {0.2 + i * 0.05}s both">
          <BookmarkDropdown {group} bind:this={bookmarkDropdowns[i]} />
        </div>
      {/each}
    </div>
  </div>
  
  <!-- Settings Modal -->
  {#if showSettings}
    <Settings on:close={() => showSettings = false} />
  {/if}
  
  <!-- Keyboard Shortcuts -->
  <KeyboardShortcuts 
    on:focusSearch={handleKeyboardShortcut}
    on:openBookmark={handleKeyboardShortcut}
    on:openSettings={handleKeyboardShortcut}
    on:nextWallpaper={handleKeyboardShortcut}
    on:closeAll={handleKeyboardShortcut}
  />
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }
  
  @keyframes fade-in-up {
    0% {
      opacity: 0;
      transform: translateY(20px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes fade-in-down {
    0% {
      opacity: 0;
      transform: translateY(-20px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
