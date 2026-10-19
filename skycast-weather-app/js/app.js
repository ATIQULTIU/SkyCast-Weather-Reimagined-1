const API = "https://api.open-meteo.com/v1/forecast";
const GEO_API = "https://geocoding-api.open-meteo.com/v1/search";
const $ = (id) => document.getElementById(id);
let currentUnit = "C";
let currentPlace = { name: "Dhaka", country: "Bangladesh", latitude: 23.8103, longitude: 90.4125, timezone: "Asia/Dhaka" };
let latestWeather = null;
let toastTimer;

const weatherCodes = {
  0: ["Clear sky", "☀"], 1: ["Mainly clear", "🌤"], 2: ["Partly cloudy", "⛅"], 3: ["Overcast", "☁"],
  45: ["Foggy", "🌫"], 48: ["Rime fog", "🌫"], 51: ["Light drizzle", "🌦"], 53: ["Drizzle", "🌦"], 55: ["Heavy drizzle", "🌧"],
  56: ["Freezing drizzle", "🌧"], 57: ["Freezing drizzle", "🌧"], 61: ["Light rain", "🌦"], 63: ["Rain", "🌧"], 65: ["Heavy rain", "🌧"],
  66: ["Freezing rain", "🌧"], 67: ["Heavy freezing rain", "🌧"], 71: ["Light snow", "🌨"], 73: ["Snow", "🌨"], 75: ["Heavy snow", "❄"],
  77: ["Snow grains", "❄"], 80: ["Rain showers", "🌦"], 81: ["Rain showers", "🌧"], 82: ["Heavy showers", "⛈"],
  85: ["Snow showers", "🌨"], 86: ["Heavy snow showers", "❄"], 95: ["Thunderstorm", "⛈"], 96: ["Thunderstorm + hail", "⛈"], 99: ["Severe thunderstorm", "⛈"]
};

function weatherInfo(code) { return weatherCodes[code] || ["Weather conditions", "☁"]; }
function celsiusToFahrenheit(c) { return (c * 9 / 5) + 32; }
function displayTemp(c) { const value = currentUnit === "C" ? c : celsiusToFahrenheit(c); return `${Math.round(value)}°`; }
function displayTempMarkup(c) { return `${Math.round(currentUnit === "C" ? c : celsiusToFahrenheit(c))}<span>°${currentUnit}</span>`; }
function showToast(message) {
  const toast = $("toast"); toast.textContent = message; toast.classList.add("show");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
}
function setStatus(message, isError = false) {
  const el = $("statusMessage"); el.textContent = message; el.classList.toggle("error-text", isError);
}
function formatDay(dateString, index) {
  if (index === 0) return "TODAY";
  return new Date(`${dateString}T12:00:00`).toLocaleDateString(undefined, { weekday: "short" }).toUpperCase();
}
function daylightLength(sunrise, sunset) {
  if (!sunrise || !sunset) return "--h --m";
  const mins = Math.max(0, Math.round((new Date(sunset) - new Date(sunrise)) / 60000));
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}
function friendlyWind(speed) {
  if (speed < 6) return "Calm and gentle";
  if (speed < 20) return "A light breeze";
  if (speed < 40) return "Breezy conditions";
  return "Strong winds";
}
function uvLabel(uv) {
  if (uv < 3) return `${uv} · Low`;
  if (uv < 6) return `${uv} · Moderate`;
  if (uv < 8) return `${uv} · High`;
  if (uv < 11) return `${uv} · Very high`;
  return `${uv} · Extreme`;
}
function renderForecast(daily) {
  const grid = $("forecastGrid");
  grid.innerHTML = daily.time.slice(0, 5).map((date, i) => {
    const [condition, icon] = weatherInfo(daily.weather_code[i]);
    return `<article class="forecast-card">
      <div class="forecast-day">${formatDay(date, i)}</div>
      <span class="forecast-icon" aria-label="${condition}">${icon}</span>
      <div class="forecast-condition">${condition}</div>
      <div class="forecast-temps"><span>${displayTemp(daily.temperature_2m_max[i])}</span><span>${displayTemp(daily.temperature_2m_min[i])}</span></div>
    </article>`;
  }).join("");
}
function renderWeather(data, place) {
  latestWeather = data;
  const now = data.current;
  const units = data.current_units;
  const [condition, icon] = weatherInfo(now.weather_code);
  const countryPart = place.country ? `, ${place.country}` : "";
  $("cityName").textContent = `${place.name}${countryPart}`;
  $("conditionText").textContent = condition;
  $("mainIcon").textContent = icon;
  $("temperature").innerHTML = displayTempMarkup(now.temperature_2m);
  $("feelsLike").textContent = displayTemp(now.apparent_temperature);
  $("daylight").textContent = daylightLength(data.daily.sunrise[0], data.daily.sunset[0]);
  $("windSummary").textContent = `${Math.round(now.wind_speed_10m)} ${currentUnit === "C" ? "km/h" : "mph"}`;
  $("uvSummary").textContent = uvLabel(Math.round(data.daily.uv_index_max[0] ?? 0));
  $("humidity").innerHTML = `${Math.round(now.relative_humidity_2m)}<small>%</small>`;
  $("humidityMeter").style.width = `${Math.min(100, now.relative_humidity_2m)}%`;
  $("humidityNote").textContent = now.relative_humidity_2m > 70 ? "A humid feel in the air" : now.relative_humidity_2m < 35 ? "Dry air around you" : "Balanced moisture levels";
  const windSpeed = Math.round(now.wind_speed_10m);
  $("wind").innerHTML = `${windSpeed}<small> ${units.wind_speed_10m}</small>`;
  $("windNote").textContent = friendlyWind(windSpeed);
  const visibilityKm = (now.visibility ?? 0) / 1000;
  $("visibility").innerHTML = `${visibilityKm.toFixed(1)}<small> km</small>`;
  $("pressure").innerHTML = `${Math.round(now.surface_pressure)}<small> hPa</small>`;
  $("skyDescription").textContent = `${condition} · ${Math.round(now.cloud_cover)}% cloud cover`;
  $("coordinates").textContent = `${Math.abs(place.latitude).toFixed(2)}° ${place.latitude >= 0 ? "N" : "S"} · ${Math.abs(place.longitude).toFixed(2)}° ${place.longitude >= 0 ? "E" : "W"}`;
  renderForecast(data.daily);
  setStatus(`Weather updated for ${place.name}. Data refreshed just now.`);
}
async function fetchWeather(place) {
  setStatus(`Reading the sky over ${place.name}…`);
  $("forecastGrid").innerHTML = '<div class="forecast-loading">Reading the forecast…</div>';
  const params = new URLSearchParams({
    latitude: place.latitude, longitude: place.longitude, timezone: place.timezone || "auto",
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,surface_pressure,wind_speed_10m,visibility",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max",
    forecast_days: "5", wind_speed_unit: currentUnit === "C" ? "kmh" : "mph"
  });
  try {
    const response = await fetch(`${API}?${params}`);
    if (!response.ok) throw new Error("Weather service is temporarily unavailable.");
    const data = await response.json();
    if (!data.current || !data.daily) throw new Error("Weather data was incomplete.");
    currentPlace = place;
    renderWeather(data, place);
  } catch (error) {
    setStatus(error.message || "Could not load weather. Please try again.", true);
    $("forecastGrid").innerHTML = '<div class="forecast-loading">Forecast unavailable. Check your connection and try again.</div>';
    showToast("Could not load weather data");
  }
}
async function searchCity(city) {
  const query = city.trim();
  if (!query) { showToast("Enter a city name first"); $("cityInput").focus(); return; }
  setStatus(`Searching for ${query}…`);
  try {
    const response = await fetch(`${GEO_API}?name=${encodeURIComponent(query)}&count=8&language=en&format=json`);
    if (!response.ok) throw new Error("City search is unavailable right now.");
    const data = await response.json();
    if (!data.results || !data.results.length) throw new Error(`No city found for “${query}”. Try another spelling.`);
    const place = data.results.find(p => p.feature_code === "PPLC") || data.results[0];
    await fetchWeather({ name: place.name, country: place.country, latitude: place.latitude, longitude: place.longitude, timezone: place.timezone });
  } catch (error) {
    setStatus(error.message || "Could not search for that city.", true);
  }
}
function useMyLocation() {
  if (!navigator.geolocation) { showToast("Location is not supported by this browser"); return; }
  setStatus("Requesting your location…");
  navigator.geolocation.getCurrentPosition(async position => {
    const { latitude, longitude } = position.coords;
    await fetchWeather({ name: "Your location", country: "", latitude, longitude, timezone: "auto" });
  }, error => {
    const message = error.code === 1 ? "Location permission was denied. Search for a city instead." : "Could not get your location. Try searching for a city.";
    setStatus(message, true);
  }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 });
}
function updateUnitToggle() {
  const spans = $("unitToggle").querySelectorAll("span");
  spans[0].classList.toggle("unit-active", currentUnit === "C");
  spans[1].classList.toggle("unit-active", currentUnit === "F");
  $("unitToggle").setAttribute("aria-label", `Switch to ${currentUnit === "C" ? "Fahrenheit" : "Celsius"}`);
}
function toggleUnits() {
  currentUnit = currentUnit === "C" ? "F" : "C";
  updateUnitToggle();
  if (latestWeather) fetchWeather(currentPlace);
}
function init() {
  $("todayLabel").textContent = new Date().toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" });
  $("searchForm").addEventListener("submit", event => { event.preventDefault(); searchCity($("cityInput").value); });
  $("locationBtn").addEventListener("click", useMyLocation);
  $("unitToggle").addEventListener("click", toggleUnits);
  fetchWeather(currentPlace);
}
document.addEventListener("DOMContentLoaded", init);
