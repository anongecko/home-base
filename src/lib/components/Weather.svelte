<script lang="ts">
  import { onMount } from 'svelte';
  import { theme } from '$lib/stores/theme';
  import { Cloud, CloudRain, CloudSnow, Sun, CloudDrizzle, Wind } from 'lucide-svelte';
  
  interface WeatherData {
    temp: number;
    condition: string;
    icon: string;
    location: string;
  }
  
  let weather: WeatherData | null = null;
  let loading = false;
  let error = false;
  
  // You'll need to add your own weather API key
  const API_KEY = 'YOUR_OPENWEATHER_API_KEY';
  const CACHE_KEY = 'weather-cache';
  const CACHE_DURATION = 600000; // 10 minutes
  
  onMount(() => {
    loadWeather();
    // Refresh every 10 minutes
    const interval = setInterval(loadWeather, CACHE_DURATION);
    return () => clearInterval(interval);
  });
  
  async function loadWeather() {
    // Check cache first
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        weather = data;
        return;
      }
    }
    
    loading = true;
    error = false;
    
    try {
      // Get user location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      
      const { latitude, longitude } = position.coords;
      
      // Fetch weather data
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`
      );
      
      if (!response.ok) throw new Error('Weather fetch failed');
      
      const data = await response.json();
      
      weather = {
        temp: Math.round(data.main.temp),
        condition: data.weather[0].main,
        icon: data.weather[0].icon,
        location: data.name
      };
      
      // Cache the result
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        data: weather,
        timestamp: Date.now()
      }));
      
    } catch (err) {
      error = true;
      console.error('Weather error:', err);
    } finally {
      loading = false;
    }
  }
  
  function getWeatherIcon(condition: string) {
    switch (condition.toLowerCase()) {
      case 'clear': return Sun;
      case 'clouds': return Cloud;
      case 'rain': return CloudRain;
      case 'drizzle': return CloudDrizzle;
      case 'snow': return CloudSnow;
      case 'wind': return Wind;
      default: return Cloud;
    }
  }
</script>

{#if weather && !error}
  <div 
    class="weather-widget"
    style="animation: fade-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.5s both"
  >
    <div class="weather-content">
      <svelte:component 
        this={getWeatherIcon(weather.condition)} 
        size={24} 
        style="color: {$theme.text}"
        class="weather-icon"
      />
      <span class="temperature" style="color: {$theme.text}">
        {weather.temp}°
      </span>
      <span class="location" style="color: {$theme.text}">
        {weather.location}
      </span>
    </div>
  </div>
{/if}

<style>
  .weather-widget {
    @apply absolute top-8 left-8;
  }
  
  .weather-content {
    @apply flex items-center gap-3 px-4 py-2 rounded-full;
    @apply backdrop-blur-xl bg-white/10 border border-white/20;
    @apply shadow-lg;
  }
  
  .weather-icon {
    @apply opacity-80;
  }
  
  .temperature {
    @apply text-2xl font-light;
    font-variant-numeric: tabular-nums;
  }
  
  .location {
    @apply text-sm opacity-70;
  }
  
  @keyframes fade-in {
    0% {
      opacity: 0;
      transform: translateY(-10px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
