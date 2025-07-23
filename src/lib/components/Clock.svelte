<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { theme } from '$lib/stores/theme';
  import { settings } from '$lib/stores/settings';
  
  let time = new Date();
  let interval: NodeJS.Timeout;
  
  // Format options
  let showSeconds = false;
  let use24Hour = true;
  
  onMount(() => {
    interval = setInterval(() => {
      time = new Date();
    }, 1000);
  });
  
  onDestroy(() => {
    clearInterval(interval);
  });
  
  $: hours = use24Hour ? time.getHours() : (time.getHours() % 12) || 12;
  $: minutes = time.getMinutes().toString().padStart(2, '0');
  $: seconds = time.getSeconds().toString().padStart(2, '0');
  $: ampm = time.getHours() >= 12 ? 'PM' : 'AM';
  
  $: dateString = time.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
</script>

<div 
  class="clock-container"
  style="animation: fade-in-down 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.4s both"
>
  <div class="time-display">
    <span class="hours">{hours}</span>
    <span class="separator">:</span>
    <span class="minutes">{minutes}</span>
    {#if showSeconds}
      <span class="separator">:</span>
      <span class="seconds">{seconds}</span>
    {/if}
    {#if !use24Hour}
      <span class="ampm">{ampm}</span>
    {/if}
  </div>
  
  <div class="date-display" style="color: {$theme.text}">
    {dateString}
  </div>
</div>

<style>
  .clock-container {
    @apply text-center mb-8;
    user-select: none;
  }
  
  .time-display {
    @apply text-6xl md:text-8xl font-light tracking-tight mb-2;
    font-variant-numeric: tabular-nums;
    text-shadow: 0 0 40px rgba(255, 255, 255, 0.5);
    animation: glow 4s ease-in-out infinite alternate;
  }
  
  @keyframes glow {
    0% { text-shadow: 0 0 40px rgba(255, 255, 255, 0.5); }
    100% { text-shadow: 0 0 60px rgba(255, 255, 255, 0.7); }
  }
  
  .hours, .minutes, .seconds {
    @apply inline-block;
    color: rgba(255, 255, 255, 0.95);
  }
  
  .separator {
    @apply inline-block mx-1;
    color: rgba(255, 255, 255, 0.6);
    animation: blink 2s ease-in-out infinite;
  }
  
  @keyframes blink {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
  }
  
  .ampm {
    @apply text-3xl md:text-4xl ml-3;
    color: rgba(255, 255, 255, 0.7);
  }
  
  .date-display {
    @apply text-lg md:text-xl opacity-70;
    letter-spacing: 0.05em;
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
