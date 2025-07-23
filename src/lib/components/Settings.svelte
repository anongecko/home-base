<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { settings } from '$lib/stores/settings';
  import { wallpaper } from '$lib/stores/wallpaper';
  import { theme } from '$lib/stores/theme';
  import { X, FolderOpen, Clock, Sparkles, Globe, Palette, Eye, Zap } from 'lucide-svelte';
  import { fade, fly, scale } from 'svelte/transition';
  import { cubicOut, elasticOut } from 'svelte/easing';
  
  const dispatch = createEventDispatcher();
  
  let currentSettings = { ...$settings };
  let availableFolders = ['nature', 'asian-beauty', 'abstract', 'minimal', 'city'];
  let activeTab = 'wallpaper';
  
  const tabs = [
    { id: 'wallpaper', label: 'Wallpaper', icon: FolderOpen },
    { id: 'effects', label: 'Effects', icon: Sparkles },
    { id: 'theme', label: 'Theme', icon: Palette },
    { id: 'search', label: 'Search', icon: Globe },
    { id: 'performance', label: 'Performance', icon: Zap }
  ];
  
  function handleSave() {
    settings.save(currentSettings);
    
    // Reload wallpapers if folder changed
    if (currentSettings.wallpaperFolder !== $settings.wallpaperFolder) {
      wallpaper.loadWallpapers(currentSettings.wallpaperFolder);
      wallpaper.startRotation(currentSettings.wallpaperFolder, currentSettings.wallpaperInterval);
    } else if (currentSettings.wallpaperInterval !== $settings.wallpaperInterval) {
      wallpaper.startRotation(currentSettings.wallpaperFolder, currentSettings.wallpaperInterval);
    }
    
    dispatch('close');
  }
  
  function handleClose() {
    dispatch('close');
  }
  
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      handleClose();
    }
  }
  
  function resetTheme() {
    currentSettings.theme = {
      extractColors: true,
      brightness: 1,
      saturation: 1
    };
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<!-- Backdrop -->
<div 
  class="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
  on:click={handleClose}
  transition:fade={{ duration: 200 }}
/>

<!-- Settings Modal -->
<div 
  class="fixed inset-0 flex items-center justify-center z-50 p-4 md:p-8"
  transition:fly={{ y: 50, duration: 300, easing: cubicOut }}
>
  <div class="settings-modal">
    <!-- Animated background -->
    <div class="modal-background" />
    
    <!-- Header -->
    <div class="modal-header">
      <h2 class="text-2xl font-semibold" style="color: {$theme.text}">Settings</h2>
      <button
        on:click={handleClose}
        class="close-button"
      >
        <X size={24} style="color: {$theme.text}" />
      </button>
    </div>
    
    <!-- Tabs -->
    <div class="tab-container">
      {#each tabs as tab}
        <button
          on:click={() => activeTab = tab.id}
          class="tab-button"
          class:active={activeTab === tab.id}
        >
          <svelte:component 
            this={tab.icon} 
            size={18} 
            style="color: {activeTab === tab.id ? $theme.primary : $theme.text}"
          />
          <span>{tab.label}</span>
        </button>
      {/each}
    </div>
    
    <!-- Content -->
    <div class="modal-content">
      {#if activeTab === 'wallpaper'}
        <div class="settings-section" in:fly={{ x: -20, duration: 300 }}>
          <div class="section-header">
            <FolderOpen size={20} style="color: {$theme.primary}" />
            <h3>Wallpaper Settings</h3>
          </div>
          
          <div class="setting-item">
            <label class="setting-label">Wallpaper Folder</label>
            <select
              bind:value={currentSettings.wallpaperFolder}
              class="setting-select"
            >
              {#each availableFolders as folder}
                <option value={folder}>{folder}</option>
              {/each}
            </select>
          </div>
          
          <div class="setting-item">
            <label class="setting-label">
              Change Interval: {currentSettings.wallpaperInterval}s
            </label>
            <input
              type="range"
              bind:value={currentSettings.wallpaperInterval}
              min="10"
              max="300"
              step="5"
              class="setting-slider"
            />
            <div class="slider-labels">
              <span>10s</span>
              <span>5 min</span>
            </div>
          </div>
          
          <div class="setting-item">
            <label class="setting-label">Transition Style</label>
            <div class="button-group">
              {#each ['fade', 'slide', 'zoom', 'blur'] as style}
                <button
                  on:click={() => currentSettings.wallpaperTransition = style}
                  class="style-button"
                  class:active={currentSettings.wallpaperTransition === style}
                >
                  {style}
                </button>
              {/each}
            </div>
          </div>
          
          <div class="setting-item">
            <label class="setting-label">
              Background Blur: {currentSettings.wallpaperBlur}px
            </label>
            <input
              type="range"
              bind:value={currentSettings.wallpaperBlur}
              min="0"
              max="20"
              step="1"
              class="setting-slider"
            />
          </div>
        </div>
      {:else if activeTab === 'effects'}
        <div class="settings-section" in:fly={{ x: -20, duration: 300 }}>
          <div class="section-header">
            <Sparkles size={20} style="color: {$theme.secondary}" />
            <h3>Visual Effects</h3>
          </div>
          
          <div class="setting-item">
            <label class="setting-label">
              Particle Count: {currentSettings.particleCount}
            </label>
            <input
              type="range"
              bind:value={currentSettings.particleCount}
              min="0"
              max="50"
              step="1"
              class="setting-slider"
            />
          </div>
          
          <div class="setting-item">
            <label class="setting-label">
              Particle Speed: {currentSettings.particleSpeed.toFixed(1)}x
            </label>
            <input
              type="range"
              bind:value={currentSettings.particleSpeed}
              min="0.1"
              max="2"
              step="0.1"
              class="setting-slider"
            />
          </div>
          
          <div class="setting-item">
            <label class="setting-toggle">
              <input
                type="checkbox"
                bind:checked={currentSettings.particleGlow}
                class="toggle-input"
              />
              <span class="toggle-label">Particle Glow Effect</span>
            </label>
          </div>
          
          <div class="setting-item">
            <label class="setting-toggle">
              <input
                type="checkbox"
                bind:checked={currentSettings.animations.parallax}
                class="toggle-input"
              />
              <span class="toggle-label">Parallax Background</span>
            </label>
          </div>
          
          <div class="setting-item">
            <label class="setting-toggle">
              <input
                type="checkbox"
                bind:checked={currentSettings.animations.glowEffects}
                class="toggle-input"
              />
              <span class="toggle-label">Glow Effects</span>
            </label>
          </div>
          
          <div class="setting-item">
            <label class="setting-toggle">
              <input
                type="checkbox"
                bind:checked={currentSettings.animations.reducedMotion}
                class="toggle-input"
              />
              <span class="toggle-label">Reduce Motion</span>
            </label>
          </div>
        </div>
      {:else if activeTab === 'theme'}
        <div class="settings-section" in:fly={{ x: -20, duration: 300 }}>
          <div class="section-header">
            <Palette size={20} style="color: {$theme.accent}" />
            <h3>Theme Settings</h3>
          </div>
          
          <div class="setting-item">
            <label class="setting-toggle">
              <input
                type="checkbox"
                bind:checked={currentSettings.theme.extractColors}
                class="toggle-input"
              />
              <span class="toggle-label">Extract Colors from Wallpaper</span>
            </label>
          </div>
          
          <div class="setting-item">
            <label class="setting-label">
              Brightness: {currentSettings.theme.brightness.toFixed(1)}
            </label>
            <input
              type="range"
              bind:value={currentSettings.theme.brightness}
              min="0.5"
              max="1.5"
              step="0.1"
              class="setting-slider"
            />
          </div>
          
          <div class="setting-item">
            <label class="setting-label">
              Saturation: {currentSettings.theme.saturation.toFixed(1)}
            </label>
            <input
              type="range"
              bind:value={currentSettings.theme.saturation}
              min="0.5"
              max="1.5"
              step="0.1"
              class="setting-slider"
            />
          </div>
          
          {#if !currentSettings.theme.extractColors}
            <div class="setting-item">
              <label class="setting-label">Custom Colors</label>
              <div class="color-inputs">
                <div class="color-input-group">
                  <input
                    type="color"
                    bind:value={currentSettings.theme.customPrimary}
                    class="color-input"
                  />
                  <span>Primary</span>
                </div>
                <div class="color-input-group">
                  <input
                    type="color"
                    bind:value={currentSettings.theme.customSecondary}
                    class="color-input"
                  />
                  <span>Secondary</span>
                </div>
                <div class="color-input-group">
                  <input
                    type="color"
                    bind:value={currentSettings.theme.customAccent}
                    class="color-input"
                  />
                  <span>Accent</span>
                </div>
              </div>
            </div>
          {/if}
          
          <button
            on:click={resetTheme}
            class="reset-button"
          >
            Reset Theme
          </button>
        </div>
      {:else if activeTab === 'search'}
        <div class="settings-section" in:fly={{ x: -20, duration: 300 }}>
          <div class="section-header">
            <Globe size={20} style="color: {$theme.primary}" />
            <h3>Search Engines</h3>
          </div>
          
          <div class="engines-list">
            {#each currentSettings.searchEngines as engine, i}
              <div class="engine-item">
                <input
                  type="text"
                  bind:value={engine.icon}
                  placeholder="🔍"
                  class="icon-input"
                />
                <input
                  type="text"
                  bind:value={engine.name}
                  placeholder="Name"
                  class="name-input"
                />
                <input
                  type="url"
                  bind:value={engine.url}
                  placeholder="https://example.com/search?q="
                  class="url-input"
                />
              </div>
            {/each}
          </div>
          
          <button
            on:click={() => {
              currentSettings.searchEngines = [...currentSettings.searchEngines, {
                id: Date.now().toString(),
                name: '',
                url: '',
                icon: '🔍'
              }];
            }}
            class="add-engine-button"
          >
            Add Search Engine
          </button>
        </div>
      {:else if activeTab === 'performance'}
        <div class="settings-section" in:fly={{ x: -20, duration: 300 }}>
          <div class="section-header">
            <Zap size={20} style="color: {$theme.secondary}" />
            <h3>Performance</h3>
          </div>
          
          <div class="performance-info">
            <p>Optimizations for 5K+ wallpapers:</p>
            <ul>
              <li>Preloading next 3 wallpapers</li>
              <li>Cache limit: 6 images</li>
              <li>WebP format recommended</li>
            </ul>
          </div>
          
          <div class="setting-item">
            <label class="setting-label">Tips for Better Performance</label>
            <ul class="tips-list">
              <li>Use WebP format (50-80% smaller)</li>
              <li>Mix 1080p wallpapers for variety</li>
              <li>Reduce particle count on slower devices</li>
              <li>Disable glow effects if needed</li>
              <li>Enable reduced motion for battery saving</li>
            </ul>
          </div>
        </div>
      {/if}
    </div>
    
    <!-- Footer -->
    <div class="modal-footer">
      <button
        on:click={handleClose}
        class="cancel-button"
      >
        Cancel
      </button>
      <button
        on:click={handleSave}
        class="save-button"
      >
        Save Changes
      </button>
    </div>
  </div>
</div>

<style>
  .settings-modal {
    @apply relative w-full max-w-3xl max-h-[85vh] flex flex-col;
    transform: translateZ(0);
  }
  
  .modal-background {
    @apply absolute inset-0 rounded-3xl;
    background: 
      linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.06)),
      radial-gradient(ellipse at top, rgba(255,255,255,0.08), transparent);
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    border: 1px solid rgba(255,255,255,0.15);
    box-shadow: 
      0 25px 50px -12px rgba(0,0,0,0.5),
      inset 0 1px 0 rgba(255,255,255,0.1);
  }
  
  .modal-header {
    @apply relative flex items-center justify-between p-6 border-b border-white/10;
  }
  
  .close-button {
    @apply p-2 rounded-xl hover:bg-white/10 transition-all duration-200;
  }
  
  .close-button:hover {
    transform: scale(1.1) rotate(90deg);
  }
  
  .tab-container {
    @apply relative flex gap-2 px-6 pt-4 overflow-x-auto;
  }
  
  .tab-button {
    @apply flex items-center gap-2 px-4 py-2 rounded-xl;
    @apply transition-all duration-300;
    @apply hover:bg-white/10;
    white-space: nowrap;
  }
  
  .tab-button.active {
    @apply bg-white/15;
    box-shadow: 
      0 4px 10px -2px rgba(0,0,0,0.2),
      inset 0 1px 0 rgba(255,255,255,0.1);
  }
  
  .modal-content {
    @apply relative flex-1 p-6 overflow-y-auto;
  }
  
  .settings-section {
    @apply space-y-6;
  }
  
  .section-header {
    @apply flex items-center gap-3 mb-4;
  }
  
  .section-header h3 {
    @apply text-lg font-semibold;
  }
  
  .setting-item {
    @apply space-y-2;
  }
  
  .setting-label {
    @apply block text-sm font-medium opacity-90;
  }
  
  .setting-select {
    @apply w-full px-4 py-3 rounded-xl bg-white/10 outline-none;
    @apply focus:bg-white/15 focus:ring-2 focus:ring-white/20;
    @apply transition-all duration-200;
  }
  
  .setting-select option {
    @apply bg-gray-900;
  }
  
  .setting-slider {
    @apply w-full h-2 rounded-full bg-white/20 outline-none appearance-none;
    @apply cursor-pointer;
  }
  
  .setting-slider::-webkit-slider-thumb {
    @apply appearance-none w-5 h-5 rounded-full cursor-pointer;
    @apply transition-all duration-200;
    background: var(--primary-color);
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  }
  
  .setting-slider::-webkit-slider-thumb:hover {
    transform: scale(1.2);
  }
  
  .slider-labels {
    @apply flex justify-between text-xs opacity-60 mt-1;
  }
  
  .button-group {
    @apply flex gap-2;
  }
  
  .style-button {
    @apply flex-1 px-4 py-2 rounded-lg capitalize;
    @apply transition-all duration-200;
    @apply hover:bg-white/10;
  }
  
  .style-button.active {
    @apply bg-white/20;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.1);
  }
  
  .setting-toggle {
    @apply flex items-center gap-3 cursor-pointer;
  }
  
  .toggle-input {
    @apply w-5 h-5 rounded;
    accent-color: var(--primary-color);
  }
  
  .toggle-label {
    @apply text-sm;
  }
  
  .color-inputs {
    @apply flex gap-4;
  }
  
  .color-input-group {
    @apply flex flex-col items-center gap-2;
  }
  
  .color-input {
    @apply w-12 h-12 rounded-lg cursor-pointer;
    @apply border-2 border-white/20;
  }
  
  .reset-button {
    @apply px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20;
    @apply transition-all duration-200;
  }
  
  .engines-list {
    @apply space-y-2 max-h-[300px] overflow-y-auto;
  }
  
  .engine-item {
    @apply flex gap-2;
  }
  
  .icon-input {
    @apply w-16 px-3 py-2 rounded-lg bg-white/10 outline-none text-center;
    @apply focus:bg-white/15 transition-all duration-200;
  }
  
  .name-input {
    @apply flex-1 px-3 py-2 rounded-lg bg-white/10 outline-none;
    @apply focus:bg-white/15 transition-all duration-200;
  }
  
  .url-input {
    @apply flex-[2] px-3 py-2 rounded-lg bg-white/10 outline-none;
    @apply focus:bg-white/15 transition-all duration-200;
  }
  
  .add-engine-button {
    @apply w-full px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20;
    @apply transition-all duration-200 mt-3;
  }
  
  .performance-info {
    @apply p-4 rounded-xl bg-white/5 text-sm;
  }
  
  .tips-list {
    @apply list-disc list-inside space-y-1 text-sm opacity-80;
  }
  
  .modal-footer {
    @apply relative flex justify-end gap-3 p-6 border-t border-white/10;
  }
  
  .cancel-button {
    @apply px-6 py-2 rounded-xl hover:bg-white/10 transition-all duration-200;
  }
  
  .save-button {
    @apply px-6 py-2 rounded-xl transition-all duration-200;
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    box-shadow: 0 4px 15px -3px var(--primary-color);
  }
  
  .save-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px -3px var(--primary-color);
  }
  
  /* Custom scrollbar */
  .modal-content::-webkit-scrollbar {
    width: 8px;
  }
  
  .modal-content::-webkit-scrollbar-track {
    @apply bg-transparent;
  }
  
  .modal-content::-webkit-scrollbar-thumb {
    @apply bg-white/20 rounded-full;
  }
  
  .modal-content::-webkit-scrollbar-thumb:hover {
    @apply bg-white/30;
  }
</style>
