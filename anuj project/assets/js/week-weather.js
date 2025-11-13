// Global variable for temperature unit
let isCelsiusWeek = true;

function showWeekForecast(data) {
  const container = document.getElementById('week-results');
  container.innerHTML = '';
  if (!data || !data.forecast || !data.forecast.forecastday) return showWeekError("Invalid data.");

  data.forecast.forecastday.forEach(day => {
    const card = document.createElement('div');
    card.className = 'card';
    const avgTemp = isCelsiusWeek ? `${day.day.avgtemp_c} °C` : `${(day.day.avgtemp_c * 9/5 + 32).toFixed(1)} °F`;
    const maxTemp = isCelsiusWeek ? `${day.day.maxtemp_c}°C` : `${(day.day.maxtemp_c * 9/5 + 32).toFixed(1)}°F`;
    const minTemp = isCelsiusWeek ? `${day.day.mintemp_c}°C` : `${(day.day.mintemp_c * 9/5 + 32).toFixed(1)}°F`;
    card.innerHTML = `
      <h3>${day.date}</h3>
      <img src="${day.day.condition.icon}" alt="${day.day.condition.text}" />
      <div>${avgTemp}</div>
      <div>${day.day.condition.text}</div>
      <div>Humidity: ${day.day.avghumidity}%</div>
      <div>Max: ${maxTemp} Min: ${minTemp}</div>
    `;
    container.appendChild(card);
  });
  document.getElementById('week-error').hidden = true;
}

function showWeekError(msg) {
  document.getElementById('week-error').textContent = msg;
  document.getElementById('week-error').hidden = false;
  document.getElementById('week-results').innerHTML = '';
}

async function fetchWeekWeather(city) {
  showWeekLoading(true);
  try {
    const res = await fetch(`${BASE_URL}forecast.json?key=${API_KEY}&q=${encodeURIComponent(city)}&days=7`);
    if (!res.ok) throw new Error("Week weather fetch failed");
    const data = await res.json();
    showWeekForecast(data);
  } catch {
    showWeekError("Could not fetch forecast data.");
  } finally {
    showWeekLoading(false);
  }
}

function showWeekLoading(isLoading) {
  const searchBtn = document.getElementById("week-search");
  const locBtn = document.getElementById("week-loc");
  if (isLoading) {
    searchBtn.disabled = true;
    searchBtn.textContent = "Loading...";
    locBtn.disabled = true;
  } else {
    searchBtn.disabled = false;
    searchBtn.textContent = "Get Forecast";
    locBtn.disabled = false;
  }
}

document.getElementById('week-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const city = document.getElementById('week-city').value.trim() || 'auto:ip';
  fetchWeekWeather(city);
});

document.getElementById('week-loc').addEventListener('click', function() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      fetchWeekWeather(`${pos.coords.latitude},${pos.coords.longitude}`);
    }, () => showWeekError("Could not determine location."));
  } else {
    showWeekError("Geolocation not supported.");
  }
});

// Unit toggle for week forecast
document.getElementById("week-unit-switch").addEventListener("change", function() {
  isCelsiusWeek = !this.checked;
  const currentData = document.getElementById("week-results").children.length > 0 ? getCurrentWeekData() : null;
  if (currentData) showWeekForecast(currentData);
});

// Function to store current week data for unit toggle
let currentWeekData = null;
function getCurrentWeekData() {
  return currentWeekData;
}

// Modify showWeekForecast to store data
function showWeekForecast(data) {
  currentWeekData = data;
  const container = document.getElementById('week-results');
  container.innerHTML = '';
  if (!data || !data.forecast || !data.forecast.forecastday) return showWeekError("Invalid data.");

  data.forecast.forecastday.forEach((day, index) => {
    const card = document.createElement('div');
    card.className = 'card forecast-card';
    card.style.animationDelay = `${index * 0.1}s`;
    const avgTemp = isCelsiusWeek ? `${day.day.avgtemp_c} °C` : `${(day.day.avgtemp_c * 9/5 + 32).toFixed(1)} °F`;
    const maxTemp = isCelsiusWeek ? `${day.day.maxtemp_c}°C` : `${(day.day.maxtemp_c * 9/5 + 32).toFixed(1)}°F`;
    const minTemp = isCelsiusWeek ? `${day.day.mintemp_c}°C` : `${(day.day.mintemp_c * 9/5 + 32).toFixed(1)}°F`;
    const date = new Date(day.date);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    card.innerHTML = `
      <h3>${dayName}</h3>
      <img src="${day.day.condition.icon}" alt="${day.day.condition.text}" />
      <div class="temp-main">${avgTemp}</div>
      <div class="condition">${day.day.condition.text}</div>
      <div class="temp-range">Max: ${maxTemp} Min: ${minTemp}</div>
      <div class="humidity">Humidity: ${day.day.avghumidity}%</div>
    `;
    container.appendChild(card);
  });
  document.getElementById('week-error').hidden = true;
}

// Fetch city suggestions for week forecast
let debounceTimerWeek;
document.getElementById("week-city").addEventListener("input", function() {
  clearTimeout(debounceTimerWeek);
  debounceTimerWeek = setTimeout(() => {
    const query = this.value.trim();
    if (query.length >= 2) {
      fetchCitySuggestionsWeek(query);
    } else {
      hideWeekSuggestions();
    }
  }, 300);
});

async function fetchCitySuggestionsWeek(query) {
  try {
    const res = await fetch(`${BASE_URL}search.json?key=${API_KEY}&q=${encodeURIComponent(query)}`);
    if (!res.ok) return;
    const suggestions = await res.json();
    showWeekSuggestions(suggestions.slice(0, 5));
  } catch (error) {
    console.error("Error fetching city suggestions:", error);
  }
}

function showWeekSuggestions(suggestions) {
  const suggestionsDiv = document.getElementById("week-suggestions");
  suggestionsDiv.innerHTML = "";
  if (suggestions.length === 0) {
    suggestionsDiv.hidden = true;
    return;
  }
  suggestions.forEach(city => {
    const item = document.createElement("div");
    item.className = "suggestion-item";
    item.innerHTML = `<span class="city-name">${city.name}</span><span class="country">${city.country}</span>`;
    item.addEventListener("click", () => {
      document.getElementById("week-city").value = `${city.name}, ${city.country}`;
      hideWeekSuggestions();
      fetchWeekWeather(`${city.name}, ${city.country}`);
    });
    suggestionsDiv.appendChild(item);
  });
  suggestionsDiv.hidden = false;
}

function hideWeekSuggestions() {
  document.getElementById("week-suggestions").hidden = true;
}

// Hide suggestions when clicking outside
document.addEventListener("click", function(e) {
  if (!document.getElementById("week-city").contains(e.target) && !document.getElementById("week-suggestions").contains(e.target)) {
    hideWeekSuggestions();
  }
});
