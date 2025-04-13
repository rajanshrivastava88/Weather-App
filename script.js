const apiKey = "3af47d87556b4864bc8135852251304";
const resultDiv = document.getElementById("result");
const iconDiv = document.getElementById("weatherIcon");
const recentDiv = document.getElementById("recentSearches");

// Try to get user's location on load
window.onload = function () {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const coords = `${position.coords.latitude},${position.coords.longitude}`;
      getWeatherData(coords);
    });
  }
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
      const { temp_c, humidity, condition, air_quality } = data.current;
      const aqi = air_quality.pm2_5.toFixed(2);
      const iconUrl = "https:" + condition.icon;

      resultDiv.innerHTML = `
        <p><span class="highlight">${name}, ${country}</span></p>
        <p>🌡️ Temperature: <span class="highlight">${temp_c}°C</span></p>
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

// Initial display of recent searches
displayRecentSearches();
