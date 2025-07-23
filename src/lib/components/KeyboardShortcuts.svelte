<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { createEventDispatcher } from 'svelte';
  
  const dispatch = createEventDispatcher();
  
  let showHelp = false;
  
  const shortcuts = [
    { key: '/', description: 'Focus search' },
    { key: '1-5', description: 'Open bookmark group' },
    { key: 'S', description: 'Open settings' },
    { key: 'H', description: 'Show/hide this help' },
    { key: 'W', description: 'Next wallpaper' },
    { key: 'ESC', description: 'Close all modals' }
  ];
  
  function handleKeydown(event: KeyboardEvent) {
    // Ignore if typing in an input
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
      if (event.key === 'Escape') {
        (event.target as HTMLElement).blur();
      }
      return;
    }
    
    // Prevent default for our shortcuts
    const preventDefault = ['/', '1', '2', '3', '4', '5', 's', 'h', 'w'];
    if (preventDefault.includes(event.key.toLowerCase())) {
      event.preventDefault();
    }
    
    switch (event.key.toLowerCase()) {
      case '/':
        dispatch('focusSearch');
        break;
        
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
        dispatch('openBookmark', { index: parseInt(event.key) - 1 });
        break;
        
      case 's':
        dispatch('openSettings');
        break;
        
      case 'h':
        showHelp = !showHelp;
        break;
        
      case 'w':
        dispatch('nextWallpaper');
        break;
        
      case 'escape':
        showHelp = false;
        dispatch('closeAll');
        break;
    }
  }
  
  onMount(() => {
    window.addEventListener('keydown', handleKeydown);
  });
  
  onDestroy(() => {
    window.removeEventListener('keydown', handleKeydown);
  });
</script>

{#if showHelp}
  <div class="shortcuts-help">
    <h3 class="text-lg font-semibold mb-3">Keyboard Shortcuts</h3>
    <div class="shortcuts-grid">
      {#each shortcuts as shortcut}
        <div class="shortcut-item">
          <kbd class="key">{shortcut.key}</kbd>
          <span class="description">{shortcut.description}</span>
        </div>
      {/each}
    </div>
  </div>
{/if}

<style>
  .shortcuts-help {
    @apply fixed bottom-8 left-8 p-6 rounded-2xl shadow-2xl;
    @apply backdrop-blur-xl bg-white/10 border border-white/20;
    animation: slide-up 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    z-index: 100;
  }
  
  @keyframes slide-up {
    0% {
      opacity: 0;
      transform: translateY(20px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .shortcuts-grid {
    @apply grid grid-cols-1 gap-2;
  }
  
  .shortcut-item {
    @apply flex items-center gap-3;
  }
  
  .key {
    @apply px-3 py-1 rounded-lg text-sm font-mono;
    @apply bg-white/20 border border-white/30;
    min-width: 3rem;
    text-align: center;
    box-shadow: 0 2px 0 rgba(0, 0, 0, 0.2);
  }
  
  .description {
    @apply text-sm opacity-80;
  }
</style>
