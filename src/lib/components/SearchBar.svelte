<script lang="ts">
  import { settings } from '$lib/stores/settings';
  import { theme } from '$lib/stores/theme';
  import { ChevronDown, Search, Sparkles } from 'lucide-svelte';
  import { fly, scale } from 'svelte/transition';
  import { cubicOut, elasticOut } from 'svelte/easing';
  import { onMount } from 'svelte';
  
  let searchQuery = '';
  let showEngines = false;
  let isFocused = false;
  let isHovered = false;
  let selectedEngine = $settings.defaultSearchEngine;
  let inputElement: HTMLInputElement;
  let containerElement: HTMLDivElement;
  let mouseX = 0;
  let mouseY = 0;
  let searchHistory: string[] = [];
  let showSuggestions = false;
  let selectedSuggestion = -1;
  
  export function focus() {
    inputElement?.focus();
  }
  
  $: currentEngine = $settings.searchEngines.find(e => e.id === selectedEngine) || $settings.searchEngines[0];
  $: filteredHistory = searchQuery 
    ? searchHistory.filter(h => h.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5)
    : [];
  
  onMount(() => {
    // Load search history
    const saved = localStorage.getItem('search-history');
    if (saved) searchHistory = JSON.parse(saved);
    
    // Mouse tracking for gradient effect
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerElement) return;
      const rect = containerElement.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width) * 100;
      mouseY = ((e.clientY - rect.top) / rect.height) * 100;
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  });
  
  function handleSearch(event?: KeyboardEvent) {
    if (event && event.key !== 'Enter') return;
    if (!searchQuery.trim()) return;
    
    // Fancy exit animation
    document.body.style.transition = 'opacity 300ms cubic-bezier(0.4, 0, 0, 1), transform 300ms cubic-bezier(0.4, 0, 0, 1)';
    document.body.style.opacity = '0';
    document.body.style.transform = 'scale(0.98)';
    
    // Save to history
    searchHistory = [searchQuery, ...searchHistory.filter(h => h !== searchQuery)].slice(0, 20);
    localStorage.setItem('search-history', JSON.stringify(searchHistory));
    
    setTimeout(() => {
      window.location.href = currentEngine.url + encodeURIComponent(searchQuery);
    }, 300);
  }
  
  function handleKeyDown(event: KeyboardEvent) {
    if (!showSuggestions || filteredHistory.length === 0) {
      if (event.key === 'Enter') handleSearch(event);
      return;
    }
    
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        selectedSuggestion = Math.min(selectedSuggestion + 1, filteredHistory.length - 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        selectedSuggestion = Math.max(selectedSuggestion - 1, -1);
        break;
      case 'Enter':
        event.preventDefault();
        if (selectedSuggestion >= 0) {
          searchQuery = filteredHistory[selectedSuggestion];
          selectedSuggestion = -1;
        }
        handleSearch();
        break;
      case 'Escape':
        showSuggestions = false;
        selectedSuggestion = -1;
        break;
    }
  }
  
  function selectEngine(engineId: string) {
    selectedEngine = engineId;
    showEngines = false;
    inputElement?.focus();
    
    // Save preference
    settings.update(s => ({ ...s, defaultSearchEngine: engineId }));
  }
  
  function handleFocus() {
    isFocused = true;
    showSuggestions = true;
  }
  
  function handleBlur(event: FocusEvent) {
    const relatedTarget = event.relatedTarget as HTMLElement;
    if (!relatedTarget?.closest('.search-container')) {
      isFocused = false;
      showEngines = false;
      setTimeout(() => showSuggestions = false, 200);
    }
  }
  
  function selectSuggestion(suggestion: string) {
    searchQuery = suggestion;
    handleSearch();
  }
  
  function clearHistory() {
    searchHistory = [];
    localStorage.removeItem('search-history');
  }
</script>

<div class="relative w-full search-container" bind:this={containerElement}>
  <!-- Dynamic Background Glow -->
  <div 
    class="absolute inset-0 rounded-3xl opacity-0 transition-all duration-700 pointer-events-none"
    class:opacity-100={isFocused}
    style="
      background: radial-gradient(
        600px circle at {mouseX}% {mouseY}%,
        {$theme.primary}15,
        transparent 40%
      );
      filter: blur(40px);
      transform: scale({isFocused ? 1.1 : 1});
    "
  />
  
  <!-- Animated Gradient Border -->
  <div 
    class="absolute inset-0 rounded-3xl p-[2px] transition-all duration-500 pointer-events-none"
    class:opacity-0={!isFocused && !isHovered}
    class:opacity-60={isHovered && !isFocused}
    class:opacity-100={isFocused}
    class:scale-105={isFocused}
  >
    <div 
      class="absolute inset-0 rounded-3xl"
      style="
        background: conic-gradient(
          from {mouseX * 3.6}deg at {mouseX}% {mouseY}%,
          {$theme.primary},
          {$theme.secondary},
          {$theme.accent},
          {$theme.primary}
        );
        animation: gradient-rotate 4s linear infinite;
      "
    />
  </div>
  
  <!-- Search Container -->
  <div 
    class="relative search-panel overflow-hidden"
    on:mouseenter={() => isHovered = true}
    on:mouseleave={() => isHovered = false}
  >
    <!-- Shimmer Effect -->
    <div 
      class="absolute inset-0 opacity-0 pointer-events-none"
      class:shimmer={isFocused}
    />
    
    <div class="flex items-center gap-3 px-6 py-4">
      <!-- Search Icon with Pulse -->
      <div class="search-icon-wrapper">
        <Search 
          size={20} 
          style="color: {$theme.text}" 
          class="search-icon transition-all duration-300"
          class:scale-110={isFocused}
          class:rotate-12={isFocused}
        />
        {#if isFocused}
          <div class="icon-pulse" style="background-color: {$theme.primary}" />
        {/if}
      </div>
      
      <!-- Input with Typewriter Effect -->
      <input
        bind:this={inputElement}
        type="text"
        bind:value={searchQuery}
        on:keydown={handleKeyDown}
        on:focus={handleFocus}
        on:blur={handleBlur}
        placeholder={isFocused ? "What's on your mind?" : "Search the web..."}
        class="flex-1 bg-transparent outline-none text-lg placeholder-white/50 transition-all duration-500"
        style="
          color: {$theme.text};
          text-shadow: {isFocused ? `0 0 20px ${$theme.primary}40` : 'none'};
        "
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
        spellcheck="false"
      />
      
      <!-- Magic Sparkle Effect -->
      {#if isFocused && searchQuery}
        <div class="sparkle-container">
          <Sparkles 
            size={16} 
            class="sparkle-icon"
            style="color: {$theme.accent}"
          />
        </div>
      {/if}
      
      <!-- Engine Selector with 3D Effect -->
      <button
        on:click={() => showEngines = !showEngines}
        class="engine-selector group"
        class:active={showEngines}
        tabindex="-1"
      >
        <span class="engine-icon text-2xl transition-all duration-300 group-hover:scale-110">
          {currentEngine.icon}
        </span>
        <ChevronDown 
          size={16} 
          style="color: {$theme.text}"
          class="transition-all duration-300 opacity-70 group-hover:opacity-100"
          class:rotate-180={showEngines}
        />
      </button>
    </div>
    
    <!-- Search Suggestions -->
    {#if showSuggestions && filteredHistory.length > 0 && isFocused}
      <div 
        class="absolute top-full mt-2 left-0 right-0 suggestion-panel"
        transition:fly={{ y: -10, duration: 200, easing: cubicOut }}
      >
        <div class="suggestion-header">
          <span class="text-xs opacity-60">Recent Searches</span>
          <button 
            on:click={clearHistory}
            class="text-xs opacity-60 hover:opacity-100 transition-opacity"
          >
            Clear
          </button>
        </div>
        {#each filteredHistory as suggestion, i}
          <button
            class="suggestion-item"
            class:selected={i === selectedSuggestion}
            on:click={() => selectSuggestion(suggestion)}
            style="animation-delay: {i * 30}ms"
          >
            <Search size={14} class="opacity-40" />
            <span>{suggestion}</span>
          </button>
        {/each}
      </div>
    {/if}
    
    <!-- Engine Dropdown with Glass Effect -->
    {#if showEngines}
      <div 
        class="absolute right-0 top-full mt-2 engine-dropdown"
        transition:fly={{ y: -10, duration: 300, easing: elasticOut }}
      >
        {#each $settings.searchEngines as engine, i}
          <button
            on:click={() => selectEngine(engine.id)}
            class="engine-option"
            class:selected={engine.id === selectedEngine}
            style="animation-delay: {i * 50}ms"
          >
            <span class="engine-option-icon text-2xl">{engine.icon}</span>
            <span class="engine-option-name" style="color: {$theme.text}">{engine.name}</span>
            {#if engine.id === selectedEngine}
              <div class="selected-indicator" style="background-color: {$theme.primary}" />
            {/if}
          </button>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  @keyframes gradient-rotate {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .search-panel {
    @apply backdrop-blur-2xl bg-white/[0.03] border border-white/10 rounded-3xl;
    @apply shadow-2xl transition-all duration-500;
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    transform: translateZ(0);
    will-change: transform;
  }
  
  .search-panel:hover {
    @apply bg-white/[0.05] border-white/20;
    transform: translateY(-1px);
    box-shadow: 
      0 20px 40px -15px rgba(0, 0, 0, 0.5),
      0 0 60px -20px var(--primary-color);
  }
  
  .shimmer {
    background: linear-gradient(
      105deg,
      transparent 40%,
      rgba(255, 255, 255, 0.1) 50%,
      transparent 60%
    );
    animation: shimmer 2s infinite;
  }
  
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  
  .search-icon-wrapper {
    @apply relative;
  }
  
  .icon-pulse {
    @apply absolute inset-0 rounded-full;
    animation: pulse-expand 1.5s ease-out infinite;
  }
  
  @keyframes pulse-expand {
    0% {
      opacity: 0.8;
      transform: scale(0.8);
    }
    100% {
      opacity: 0;
      transform: scale(2.5);
    }
  }
  
  .sparkle-container {
    @apply relative;
  }
  
  .sparkle-icon {
    animation: sparkle-rotate 2s linear infinite;
  }
  
  @keyframes sparkle-rotate {
    0% { transform: rotate(0deg) scale(1); }
    50% { transform: rotate(180deg) scale(1.2); }
    100% { transform: rotate(360deg) scale(1); }
  }
  
  .engine-selector {
    @apply flex items-center gap-2 px-4 py-2 rounded-2xl;
    @apply transition-all duration-300;
    @apply hover:bg-white/10;
    background: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.05);
  }
  
  .engine-selector:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 20px -5px rgba(0, 0, 0, 0.3);
  }
  
  .engine-selector.active {
    @apply bg-white/10;
    transform: scale(0.95);
  }
  
  .engine-icon {
    filter: drop-shadow(0 0 10px currentColor);
  }
  
  .suggestion-panel,
  .engine-dropdown {
    @apply backdrop-blur-2xl bg-white/[0.08] border border-white/15 rounded-2xl;
    @apply shadow-2xl overflow-hidden;
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
  }
  
  .suggestion-header {
    @apply flex justify-between items-center px-4 py-2 border-b border-white/10;
  }
  
  .suggestion-item {
    @apply w-full flex items-center gap-3 px-4 py-3;
    @apply transition-all duration-200 text-left;
    @apply hover:bg-white/10;
    animation: slide-in 300ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
  }
  
  .suggestion-item.selected {
    @apply bg-white/15;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.1);
  }
  
  .engine-dropdown {
    min-width: 220px;
  }
  
  .engine-option {
    @apply w-full flex items-center gap-3 px-4 py-3 relative;
    @apply transition-all duration-300 text-left;
    @apply hover:bg-white/10 hover:translate-x-1;
    animation: slide-in 400ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
  }
  
  .engine-option:hover .engine-option-icon {
    transform: rotate(360deg);
    transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  
  .engine-option.selected {
    @apply bg-white/15;
  }
  
  .selected-indicator {
    @apply absolute left-0 top-0 bottom-0 w-1;
    animation: slide-in-left 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  
  @keyframes slide-in {
    0% { 
      opacity: 0;
      transform: translateY(-10px);
    }
    100% { 
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes slide-in-left {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(0); }
  }
  
  input {
    font-feature-settings: "ss01", "ss02", "cv01", "cv11";
    letter-spacing: 0.01em;
  }
  
  input::selection {
    background-color: var(--primary-color);
    color: white;
    text-shadow: none;
  }
  
  /* Responsive text size */
  @media (max-width: 640px) {
    input {
      @apply text-base;
    }
  }
</style>
