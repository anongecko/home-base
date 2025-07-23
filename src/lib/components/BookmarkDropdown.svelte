<script lang="ts">
  import type { BookmarkGroup } from '$lib/types';
  import { theme } from '$lib/stores/theme';
  import { settings } from '$lib/stores/settings';
  import { fly, scale } from 'svelte/transition';
  import { Plus, Edit2, Trash2, ExternalLink, Sparkles } from 'lucide-svelte';
  import { cubicOut, elasticOut } from 'svelte/easing';
  import { onMount } from 'svelte';
  
  export let group: BookmarkGroup;
  
  let isOpen = false;
  let isEditing = false;
  let editingBookmark: string | null = null;
  let newBookmark = { title: '', url: '' };
  let iconElement: HTMLButtonElement;
  let isHovered = false;
  let iconRotation = 0;
  let mouseX = 0;
  let mouseY = 0;
  
  export function toggle() {
    isOpen = !isOpen;
    animateIcon();
  }
  
  export function close() {
    isOpen = false;
    isEditing = false;
  }
  
  function animateIcon() {
    if (iconElement && $settings.animations.glowEffects) {
      iconRotation += 360;
      iconElement.animate([
        { transform: 'scale(1) rotateY(0deg) rotateX(0deg)' },
        { transform: 'scale(0.9) rotateY(180deg) rotateX(10deg)' },
        { transform: 'scale(1.1) rotateY(360deg) rotateX(0deg)' },
        { transform: 'scale(1) rotateY(360deg) rotateX(0deg)' }
      ], {
        duration: 600,
        easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
      });
    }
  }
  
  function toggleDropdown() {
    isOpen = !isOpen;
    animateIcon();
  }
  
  function handleContextMenu(event: MouseEvent) {
    event.preventDefault();
    isEditing = !isEditing;
  }
  
  function addBookmark() {
    if (newBookmark.title && newBookmark.url) {
      const updatedSettings = { ...$settings };
      const groupIndex = updatedSettings.bookmarkGroups.findIndex(g => g.id === group.id);
      
      updatedSettings.bookmarkGroups[groupIndex].bookmarks.push({
        id: Date.now().toString(),
        title: newBookmark.title,
        url: newBookmark.url.startsWith('http') ? newBookmark.url : `https://${newBookmark.url}`
      });
      
      settings.save(updatedSettings);
      newBookmark = { title: '', url: '' };
    }
  }
  
  function deleteBookmark(bookmarkId: string) {
    const updatedSettings = { ...$settings };
    const groupIndex = updatedSettings.bookmarkGroups.findIndex(g => g.id === group.id);
    
    updatedSettings.bookmarkGroups[groupIndex].bookmarks = 
      updatedSettings.bookmarkGroups[groupIndex].bookmarks.filter(b => b.id !== bookmarkId);
    
    settings.save(updatedSettings);
  }
  
  function getDomain(url: string): string {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  }
  
  function handleMouseMove(e: MouseEvent) {
    if (!iconElement) return;
    const rect = iconElement.getBoundingClientRect();
    mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 30;
    mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * -30;
  }
</script>

<div class="relative bookmark-container">
  <!-- 3D Bookmark Icon -->
  <button
    bind:this={iconElement}
    on:click={toggleDropdown}
    on:contextmenu={handleContextMenu}
    on:mouseenter={() => isHovered = true}
    on:mouseleave={() => isHovered = false}
    on:mousemove={handleMouseMove}
    class="bookmark-icon group"
    class:active={isOpen}
    class:editing={isEditing}
    style="
      transform: rotateX({isHovered ? mouseY : 15}deg) 
                 rotateY({isHovered ? mouseX : -15}deg) 
                 translateZ({isHovered ? 10 : 0}px)
                 scale({isOpen ? 0.95 : 1});
    "
  >
    <div class="icon-inner" style="transform: rotateY({iconRotation}deg)">
      <div class="icon-face icon-front">
        <span class="icon-emoji">{group.icon}</span>
        {#if isHovered && $settings.animations.glowEffects}
          <Sparkles 
            size={16} 
            class="sparkle-overlay"
            style="color: {$theme.accent}"
          />
        {/if}
      </div>
      <div class="icon-face icon-back">{group.icon}</div>
      <div class="icon-face icon-left"></div>
      <div class="icon-face icon-right"></div>
      <div class="icon-face icon-top"></div>
      <div class="icon-face icon-bottom"></div>
    </div>
    
    <!-- Dynamic glow effect -->
    {#if $settings.animations.glowEffects}
      <div 
        class="glow-effect"
        class:active={isHovered}
        style="
          background: radial-gradient(circle at center, {$theme.primary}60, transparent 70%);
          transform: scale({isHovered ? 1.5 : 1});
        "
      />
    {/if}
  </button>
  
  <!-- Dropdown Menu -->
  {#if isOpen}
    <div 
      class="dropdown-menu"
      transition:fly={{ y: -20, duration: 400, easing: elasticOut }}
    >
      <!-- Animated background -->
      <div class="dropdown-background" />
      
      <div class="dropdown-header">
        <h3 class="group-title" style="color: {$theme.text}">
          {group.title}
          {#if group.bookmarks.length > 0}
            <span class="bookmark-count">{group.bookmarks.length}</span>
          {/if}
        </h3>
        {#if !isEditing}
          <button
            on:click={() => isEditing = true}
            class="edit-button"
            title="Edit bookmarks"
          >
            <Edit2 size={14} />
          </button>
        {:else}
          <button
            on:click={() => isEditing = false}
            class="edit-button done-button"
            title="Done editing"
          >
            Done
          </button>
        {/if}
      </div>
      
      <!-- Bookmarks -->
      <div class="bookmarks-list">
        {#if group.bookmarks.length === 0}
          <p class="empty-state">No bookmarks yet</p>
        {/if}
        
        {#each group.bookmarks as bookmark, i}
          <div 
            class="bookmark-item group"
            style="animation-delay: {i * 40}ms"
            class:editing={isEditing}
          >
            <a
              href={bookmark.url}
              class="bookmark-link"
              style="color: {$theme.text}"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div class="bookmark-content">
                <span class="bookmark-title">{bookmark.title}</span>
                <span class="bookmark-domain">{getDomain(bookmark.url)}</span>
              </div>
            </a>
            
            <div class="bookmark-actions">
              <ExternalLink size={14} class="external-icon" />
              {#if isEditing}
                <button
                  on:click={() => deleteBookmark(bookmark.id)}
                  class="delete-button"
                  transition:scale={{ duration: 200, easing: elasticOut }}
                >
                  <Trash2 size={14} />
                </button>
              {/if}
            </div>
          </div>
        {/each}
      </div>
      
      <!-- Add New Bookmark -->
      {#if isEditing}
        <div class="add-bookmark-section" transition:fly={{ y: -10, duration: 300 }}>
          <input
            type="text"
            bind:value={newBookmark.title}
            placeholder="Bookmark name"
            class="input-field"
            style="color: {$theme.text}"
            on:keydown={(e) => e.key === 'Enter' && newBookmark.url && addBookmark()}
          />
          <div class="url-input-group">
            <input
              type="url"
              bind:value={newBookmark.url}
              placeholder="URL or domain.com"
              class="input-field"
              style="color: {$theme.text}"
              on:keydown={(e) => e.key === 'Enter' && addBookmark()}
            />
            <button
              on:click={addBookmark}
              class="add-button"
              disabled={!newBookmark.title || !newBookmark.url}
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .bookmark-container {
    perspective: 1200px;
    transform-style: preserve-3d;
  }
  
  .bookmark-icon {
    @apply relative w-20 h-20 cursor-pointer;
    transform-style: preserve-3d;
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    will-change: transform;
  }
  
  .bookmark-icon:hover {
    transform: translateY(-5px);
  }
  
  .bookmark-icon.active {
    transform: translateY(-2px) scale(0.98);
  }
  
  .bookmark-icon.editing {
    animation: wiggle 0.5s ease-in-out;
  }
  
  @keyframes wiggle {
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(-5deg); }
    75% { transform: rotate(5deg); }
  }
  
  .icon-inner {
    @apply relative w-full h-full;
    transform-style: preserve-3d;
    transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
    animation: float 6s ease-in-out infinite;
  }
  
  @keyframes float {
    0%, 100% { transform: translateZ(0) rotateX(0deg); }
    50% { transform: translateZ(10px) rotateX(5deg); }
  }
  
  .icon-face {
    @apply absolute flex items-center justify-center select-none;
    @apply backdrop-blur-xl bg-white/10 border border-white/20;
    backface-visibility: hidden;
  }
  
  .icon-front {
    @apply w-full h-full rounded-2xl overflow-hidden;
    transform: translateZ(10px);
    background: 
      linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.05)),
      radial-gradient(ellipse at top left, rgba(255,255,255,0.1), transparent);
    box-shadow: 
      0 10px 30px -10px rgba(0,0,0,0.5),
      inset 0 1px 0 rgba(255,255,255,0.3),
      inset 0 -1px 0 rgba(0,0,0,0.1);
  }
  
  .icon-emoji {
    @apply text-4xl relative z-10;
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
  }
  
  .sparkle-overlay {
    @apply absolute top-1 right-1 opacity-0 group-hover:opacity-100;
    animation: sparkle-spin 2s linear infinite;
    transition: opacity 0.3s;
  }
  
  @keyframes sparkle-spin {
    0% { transform: rotate(0deg) scale(0.8); }
    50% { transform: rotate(180deg) scale(1.2); }
    100% { transform: rotate(360deg) scale(0.8); }
  }
  
  .icon-back {
    @apply w-full h-full rounded-2xl;
    transform: rotateY(180deg) translateZ(10px);
    background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.02));
  }
  
  .icon-left, .icon-right {
    width: 20px;
    height: 100%;
    left: 30px;
    background: rgba(255,255,255,0.08);
  }
  
  .icon-left {
    transform: rotateY(-90deg) translateZ(10px);
  }
  
  .icon-right {
    transform: rotateY(90deg) translateZ(10px);
  }
  
  .icon-top, .icon-bottom {
    @apply w-full;
    height: 20px;
    top: 30px;
    background: rgba(255,255,255,0.08);
  }
  
  .icon-top {
    transform: rotateX(90deg) translateZ(10px);
  }
  
  .icon-bottom {
    transform: rotateX(-90deg) translateZ(10px);
  }
  
  .glow-effect {
    @apply absolute inset-0 rounded-2xl opacity-0 pointer-events-none;
    filter: blur(20px);
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  
  .glow-effect.active {
    @apply opacity-100;
  }
  
  .dropdown-menu {
    @apply absolute top-full mt-4 z-20 overflow-hidden;
    min-width: 320px;
    max-width: 400px;
    transform: translateZ(0);
  }
  
  .dropdown-background {
    @apply absolute inset-0 rounded-2xl;
    background: 
      linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.06)),
      radial-gradient(ellipse at top, rgba(255,255,255,0.08), transparent);
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    border: 1px solid rgba(255,255,255,0.15);
    box-shadow: 
      0 20px 40px -10px rgba(0,0,0,0.4),
      inset 0 1px 0 rgba(255,255,255,0.1);
  }
  
  .dropdown-header {
    @apply relative flex items-center justify-between px-4 py-3 border-b border-white/10;
  }
  
  .group-title {
    @apply text-sm font-semibold flex items-center gap-2;
  }
  
  .bookmark-count {
    @apply text-xs px-2 py-0.5 rounded-full bg-white/10;
    font-variant-numeric: tabular-nums;
  }
  
  .edit-button {
    @apply relative px-3 py-1.5 rounded-lg text-xs font-medium;
    @apply transition-all duration-200;
    @apply hover:bg-white/10;
  }
  
  .done-button {
    @apply bg-white/10;
  }
  
  .bookmarks-list {
    @apply relative py-2 max-h-[400px] overflow-y-auto overflow-x-hidden;
  }
  
  .empty-state {
    @apply text-center py-8 text-sm opacity-50;
  }
  
  .bookmark-item {
    @apply relative flex items-center justify-between px-3 py-2 mx-2 rounded-xl;
    @apply transition-all duration-300;
    animation: slide-in 400ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
  }
  
  .bookmark-item:hover {
    @apply bg-white/10;
    transform: translateX(4px);
  }
  
  .bookmark-item.editing {
    @apply pr-12;
  }
  
  @keyframes slide-in {
    0% { 
      opacity: 0;
      transform: translateX(-30px) scale(0.9);
    }
    100% { 
      opacity: 1;
      transform: translateX(0) scale(1);
    }
  }
  
  .bookmark-link {
    @apply flex-1 flex items-center py-1;
  }
  
  .bookmark-content {
    @apply flex flex-col;
  }
  
  .bookmark-title {
    @apply text-sm font-medium;
    letter-spacing: 0.01em;
  }
  
  .bookmark-domain {
    @apply text-xs opacity-60 mt-0.5;
  }
  
  .bookmark-actions {
    @apply flex items-center gap-2 opacity-0 group-hover:opacity-100;
    @apply transition-all duration-200;
  }
  
  .external-icon {
    @apply opacity-40;
  }
  
  .delete-button {
    @apply p-1.5 rounded-lg hover:bg-red-500/20 transition-all duration-200;
    @apply text-red-300 hover:text-red-200;
  }
  
  .delete-button:hover {
    transform: scale(1.1);
  }
  
  .add-bookmark-section {
    @apply relative px-4 py-3 border-t border-white/10 space-y-2;
    background: rgba(255,255,255,0.02);
  }
  
  .input-field {
    @apply w-full px-3 py-2 rounded-lg bg-white/10 outline-none text-sm;
    @apply transition-all duration-200;
    @apply placeholder-white/40;
    @apply focus:bg-white/15 focus:ring-2 focus:ring-white/20;
    backdrop-filter: blur(10px);
  }
  
  .url-input-group {
    @apply flex gap-2;
  }
  
  .add-button {
    @apply px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20;
    @apply transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed;
    @apply hover:scale-105 active:scale-95;
  }
  
  /* Custom scrollbar for bookmarks list */
  .bookmarks-list::-webkit-scrollbar {
    width: 6px;
  }
  
  .bookmarks-list::-webkit-scrollbar-track {
    @apply bg-transparent;
  }
  
  .bookmarks-list::-webkit-scrollbar-thumb {
    @apply bg-white/20 rounded-full;
  }
  
  .bookmarks-list::-webkit-scrollbar-thumb:hover {
    @apply bg-white/30;
  }
  
  @media (prefers-reduced-motion: reduce) {
    .icon-inner,
    .bookmark-item,
    .sparkle-overlay {
      animation: none !important;
    }
  }
</style>
