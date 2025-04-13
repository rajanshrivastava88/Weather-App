const apiKey = "3af47d87556b4864bc8135852251304";
const resultDiv = document.getElementById("result");
const iconDiv = document.getElementById("weatherIcon");
const recentDiv = document.getElementById("recentSearches");
const themeToggle = document.getElementById("themeToggle");
const unitToggle = document.getElementById("unitToggle");

let isFahrenheit = localStorage.getItem("unit") === "F";
let isLight = localStorage.getItem("theme") === "light";

// Auto-detect location
window.onload = () => {
  if (isLight) toggleTheme(true);
  if (isFahrenheit) toggleUnit(true);
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const coords = `${position.coords.latitude},${position.coords.longitude}`;
      getWeatherData(coords);
    });
  }
  displayRecentSearches();
};

function getWeather() {
  const location = document.getElementById("locationInput").value.trim();
  if (!location) {
    resultDiv.innerHTML = "<p>Please enter a location! 🙏</p>";
    return;
  }
  saveSearch(location);
  getWeatherData(location);
}

async function getWeatherData(location) {
  resultDiv.innerHTML = "<p>Loading weather data...</p>";
  iconDiv.innerHTML = "";
  try {
    const res = await fetch(`http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(location)}&aqi=yes`);
    const data = await res.json();

    if (data.error) {
      resultDiv.innerHTML = `<p>Error: ${data.error.message}</p>`;
    } else {
      const { name, country } = data.location;
      const { temp_c, temp_f, humidity, condition, air_quality } = data.current;
      const aqi = air_quality.pm2_5.toFixed(2);
      const iconUrl = "https:" + condition.icon;

      const temperature = isFahrenheit ? `${temp_f}°F` : `${temp_c}°C`;
      resultDiv.innerHTML = `
        <p><span class="highlight">${name}, ${country}</span></p>
        <p>🌡️ Temperature: <span class="highlight">${temperature}</span></p>
        <p>💧 Humidity: <span class="highlight">${humidity}%</span></p>
        <p>🌫️ AQI (PM2.5): <span class="highlight">${aqi}</span></p>
        <p>${condition.text}</p>
      `;
      iconDiv.innerHTML = `<img src="${iconUrl}" alt="Weather Icon" />`;
    }
  } catch (err) {
    resultDiv.innerHTML = "<p>Failed to fetch weather. Try again later. 😞</p>";
    console.error(err);
  }
}

function saveSearch(query) {
  let recent = JSON.parse(localStorage.getItem("recentSearches")) || [];
  if (!recent.includes(query)) {
    recent.unshift(query);
    if (recent.length > 5) recent.pop();
    localStorage.setItem("recentSearches", JSON.stringify(recent));
  }
  displayRecentSearches();
}

function displayRecentSearches() {
  let recent = JSON.parse(localStorage.getItem("recentSearches")) || [];
  if (recent.length > 0) {
    recentDiv.innerHTML = `Recent Searches: ${recent.map(r => `<span>${r}</span>`).join(", ")}`;
  }
}

themeToggle.addEventListener("click", () => {
  isLight = !isLight;
  toggleTheme(isLight);
});

function toggleTheme(light) {
  document.body.classList.toggle("light-mode", light);
  themeToggle.textContent = light ? "🌞 Light Mode" : "🌙 Dark Mode";
  localStorage.setItem("theme", light ? "light" : "dark");
}

unitToggle.addEventListener("click", () => {
  isFahrenheit = !isFahrenheit;
  unitToggle.textContent = isFahrenheit ? "Switch to °C" : "Switch to °F";
  localStorage.setItem("unit", isFahrenheit ? "F" : "C");
  const lastLocation = JSON.parse(localStorage.getItem("recentSearches"))?.[0];
  if (lastLocation) getWeatherData(lastLocation);
});

function toggleUnit(fahrenheit) {
  isFahrenheit = fahrenheit;
  unitToggle.textContent = fahrenheit ? "Switch to °C" : "Switch to °F";
}