// Global variable for temperature unit
let isCelsius = true;

// Display current weather info in the panel
function showWeather(data) {
  if (!data || !data.current || !data.location) return showError("Invalid data.");
  document.getElementById("loc-name").textContent = data.location.name;
  document.getElementById("desc").textContent = data.current.condition.text;
  document.getElementById("icon").src = data.current.condition.icon;
  document.getElementById("icon").alt = data.current.condition.text;
  const temp = isCelsius ? data.current.temp_c : (data.current.temp_c * 9/5 + 32).toFixed(1);
  document.getElementById("temp-val").textContent = temp;
  document.getElementById("hum").textContent = data.current.humidity;
  document.getElementById("wind").textContent = (data.current.wind_kph / 3.6).toFixed(1); // kph to m/s
  document.getElementById("press").textContent = data.current.pressure_mb;
  document.getElementById("current").hidden = false;
  document.getElementById("error").hidden = true;
}

// Show error in the error panel
function showError(msg) {
  document.getElementById("error").textContent = msg;
  document.getElementById("error").hidden = false;
  document.getElementById("current").hidden = true;
}


async function fetchWeatherForCity(city) {
  showLoading(true);
  try {
    const res = await fetch(`${BASE_URL}current.json?key=${API_KEY}&q=${encodeURIComponent(city)}`);
    if (!res.ok) throw new Error("Weather fetch failed");
    const data = await res.json();
    showWeather(data);
  } catch {
    showError("Could not fetch weather data.");
  } finally {
    showLoading(false);
  }
}

function showLoading(isLoading) {
  const submitBtn = document.getElementById("city-submit");
  const locBtn = document.getElementById("loc-btn");
  if (isLoading) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Loading...";
    locBtn.disabled = true;
  } else {
    submitBtn.disabled = false;
    submitBtn.textContent = "Search";
    locBtn.disabled = false;
  }
}


document.getElementById("city-form").addEventListener("submit", function(e) {
  e.preventDefault();
  const city = document.getElementById("city-input").value.trim();
  if (city) fetchWeatherForCity(city);
  else showError("Please enter a city.");
});


document.getElementById("loc-btn").addEventListener("click", function() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      pos => fetchWeatherForCity(`${pos.coords.latitude},${pos.coords.longitude}`),
      () => showError("Could not determine location.")
    );
  } else {
    showError("Geolocation not supported.");
  }
});

// Unit toggle
document.getElementById("unit-switch").addEventListener("change", function() {
  isCelsius = !this.checked;
  const currentData = document.getElementById("current").hidden ? null : getCurrentWeatherData();
  if (currentData) showWeather(currentData);
});

// Function to store current weather data for unit toggle
let currentWeatherData = null;
function getCurrentWeatherData() {
  return currentWeatherData;
}

// Modify showWeather to store data
function showWeather(data) {
  currentWeatherData = data;
  if (!data || !data.current || !data.location) return showError("Invalid data.");
  document.getElementById("loc-name").textContent = data.location.name;
  document.getElementById("desc").textContent = data.current.condition.text;
  document.getElementById("icon").src = data.current.condition.icon;
  document.getElementById("icon").alt = data.current.condition.text;
  const temp = isCelsius ? data.current.temp_c : (data.current.temp_c * 9/5 + 32).toFixed(1);
  const unit = isCelsius ? '°C' : '°F';
  document.getElementById("temp-val").textContent = temp;
  document.getElementById("temp-unit").textContent = unit;
  // Update stat items with icons
  document.getElementById("hum").parentElement.innerHTML = `<span class="stat-icon">💧</span><span>Humidity</span><strong id="hum">${data.current.humidity}</strong>%`;
  document.getElementById("wind").parentElement.innerHTML = `<span class="stat-icon">💨</span><span>Wind</span><strong id="wind">${(data.current.wind_kph / 3.6).toFixed(1)}</strong> m/s`;
  document.getElementById("press").parentElement.innerHTML = `<span class="stat-icon">📊</span><span>Pressure</span><strong id="press">${data.current.pressure_mb}</strong> hPa`;
  document.getElementById("current").hidden = false;
  document.getElementById("error").hidden = true;
}

// Fetch city suggestions
let debounceTimer;
document.getElementById("city-input").addEventListener("input", function() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    const query = this.value.trim();
    if (query.length >= 2) {
      fetchCitySuggestions(query);
    } else {
      hideSuggestions();
    }
  }, 300);
});

async function fetchCitySuggestions(query) {
  try {
    const res = await fetch(`${BASE_URL}search.json?key=${API_KEY}&q=${encodeURIComponent(query)}`);
    if (!res.ok) return;
    const suggestions = await res.json();
    showSuggestions(suggestions.slice(0, 5));
  } catch (error) {
    console.error("Error fetching city suggestions:", error);
  }
}

function showSuggestions(suggestions) {
  const suggestionsDiv = document.getElementById("suggestions");
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
      document.getElementById("city-input").value = `${city.name}, ${city.country}`;
      hideSuggestions();
      fetchWeatherForCity(`${city.name}, ${city.country}`);
    });
    suggestionsDiv.appendChild(item);
  });
  suggestionsDiv.hidden = false;
}

function hideSuggestions() {
  document.getElementById("suggestions").hidden = true;
}

// Hide suggestions when clicking outside
document.addEventListener("click", function(e) {
  if (!document.getElementById("city-input").contains(e.target) && !document.getElementById("suggestions").contains(e.target)) {
    hideSuggestions();
  }
});
