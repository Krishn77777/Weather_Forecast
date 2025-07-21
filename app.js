


//  API configuration
const apiKey = "29d5b8f6c4f69a544bc78dcd959a43ca";
const url = `https://api.openweathermap.org/data/2.5/weather?units=metric&q=`;
const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=`;

// DOM elements
const searchBox = document.querySelector('#location');
const searchBtn = document.querySelector('.searchBtn');
const forecastContainer = document.getElementById("forecast-container");
const showDataBox = document.querySelector(".showData");
const forecastSection = document.querySelector(".forecast-section");
const errorBox = document.getElementById("error-box");
const currentLocationBtn = document.querySelector(".currentLocationBtn");
const recentCitiesDatalist = document.getElementById("recentCities");

// Error Handling
function showError(message) {
  errorBox.textContent = message;
  errorBox.classList.remove("hidden");
}

function clearError() {
  errorBox.classList.add("hidden");
  errorBox.textContent = "";
}

// Forecast Section
function showForecastSection() {
  forecastSection.classList.remove("hidden", "opacity-0", "scale-95");
  forecastSection.classList.add("opacity-100", "scale-100");
}

function hideForecastSection() {
  forecastSection.classList.add("hidden", "opacity-0", "scale-95");
}

// EventListener On Clicking Search Button
searchBtn.addEventListener("click", function () {
  const city = searchBox.value.trim();
  if (!city) return;

  clearError();
  fetchCurrentWeather(city);    
  fetchForecast(city);         
  updateRecentCities(city);    
  searchBox.value = "";     
});

// If user selects a city from recent cities
searchBox.addEventListener("input", () => {
  const city = searchBox.value.trim();
  const recent = JSON.parse(localStorage.getItem("recentCities")) || [];
  if (recent.some(c => c.toLowerCase() === city.toLowerCase())) {
    fetchCurrentWeather(city);
    fetchForecast(city);
  }
});

// EventListener On Clicking "Use Current Location" Button
currentLocationBtn.addEventListener("click", () => {
  clearError();
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      fetchByCoords(lat, lon);
    }, () => {
      showError("Unable to retrieve your location.");
    });
  } else {
    showError("Geolocation is not supported by your browser.");
  }
});

// Function to fetch weather data from entered city
async function fetchCurrentWeather(city) {
  try {
    const data = await fetch(url + city + `&appid=${apiKey}`);
    const response = await data.json();

    if (response.cod === "404" || response.cod === "400") {
      showError("City not found. Please enter a valid city name.");
      showDataBox.classList.add("hidden", "opacity-0", "scale-95");
      hideForecastSection();
      forecastContainer.innerHTML = "";
      return;
    }

    displayCurrentWeather(response);
  } catch (error) {
    showError("Something went wrong. Please try again later.");
    console.error(error);
  }
}

// Display current weather 
function displayCurrentWeather(response) {
  
  document.querySelector(".city").innerHTML = `${response.name}`;
  document.querySelector(".temperature").innerHTML = `Temperature: ${Math.round(response.main.temp)}°C`;
  document.querySelector(".humidity").innerHTML = `Humidity: ${response.main.humidity}%`;
  document.querySelector(".wind-speed").innerHTML = `Wind: ${response.wind.speed} m/s`;

  // Show icon based on weather condition
  const weatherIcon = document.querySelector(".weatherIcon");
  const weatherCondition = document.querySelector(".weatherCondition");
  const condition = response.weather[0].main;

  const iconMap = {
    Clouds: "clouds.png",
    Clear: "clear.png",
    Rain: "rain.png",
    Drizzle: "drizzle.png",
    Mist: "mist.png",
    Snow: "snow.png"
  };

  weatherIcon.src = `./images/${iconMap[condition] || "default.jpg"}`;
  weatherCondition.innerHTML = condition;
  weatherIcon.classList.remove("hidden");

  showDataBox.classList.remove("hidden", "opacity-0", "scale-95");
  showDataBox.classList.add("opacity-100", "scale-100");
}

// Function to Fetch and display 5-day forecast
function fetchForecast(city) {
  fetch(`${forecastUrl}${city}&appid=${apiKey}&units=metric`)
    .then(data => data.json())
    .then(response => {
      forecastContainer.innerHTML = "";

      const dailyForecasts = response.list.filter(item => item.dt_txt.includes("12:00:00"));

      dailyForecasts.slice(0, 5).forEach(item => {
        const dateStr = item.dt_txt.split(" ")[0];
        const dateObj = new Date(dateStr);
        const dayName = dateObj.toLocaleDateString("en-US", { weekday: 'long' });

        const temp = Math.round(item.main.temp);
        const wind = item.wind.speed;
        const humidity = item.main.humidity;
        const desc = item.weather[0].main;

        const iconMap = {
          Clouds: "clouds.png",
          Clear: "clear.png",
          Rain: "rain.png",
          Drizzle: "drizzle.png",
          Mist: "mist.png",
          Snow: "snow.png"
        };

        const imageFile = iconMap[desc] || "default.jpg";

        // Create forecast card
        const card = document.createElement("div");
        card.className = "bg-gray-600 text-white rounded p-3 text-center space-y-1 text-sm";

        card.innerHTML = `
          <p class="font-semibold text-base">${dayName}</p>
          <p class="text-xs mb-1">${dateStr}</p>
          <img src="./images/${imageFile}" class="w-10 h-10 mx-auto" alt="${desc}">
          <p>Temp: ${temp}°C</p>
          <p>Wind: ${wind} m/s</p>
          <p>Humidity: ${humidity}%</p>
        `;

        forecastContainer.appendChild(card);
      });

      showForecastSection(); 
    })
    .catch(error => {
      hideForecastSection();
      forecastContainer.innerHTML = `<p class="text-red-500">Failed to load forecast.</p>`;
      console.error("Forecast fetch error:", error);
    });
}

//  Fetch weather & forecast by geolocation coordinates
function fetchByCoords(lat, lon) {
  fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`)
    .then(res => res.json())
    .then(data => {
      displayCurrentWeather(data);
      return fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`);
    })
    .then(res => res.json())
    .then(data => {
      forecastContainer.innerHTML = "";
      const dailyForecasts = data.list.filter(item => item.dt_txt.includes("12:00:00"));

      dailyForecasts.slice(0, 5).forEach(item => {
        const dateStr = item.dt_txt.split(" ")[0];
        const dateObj = new Date(dateStr);
        const dayName = dateObj.toLocaleDateString("en-US", { weekday: 'long' });

        const temp = Math.round(item.main.temp);
        const wind = item.wind.speed;
        const humidity = item.main.humidity;
        const desc = item.weather[0].main;

        const iconMap = {
          Clouds: "clouds.png",
          Clear: "clear.png",
          Rain: "rain.png",
          Drizzle: "drizzle.png",
          Mist: "mist.png",
          Snow: "snow.png"
        };

        const imageFile = iconMap[desc] || "default.jpg";

        const card = document.createElement("div");
        card.className = "bg-gray-600 text-white rounded p-3 text-center space-y-1 text-sm";

        card.innerHTML = `
          <p class="font-semibold text-base">${dayName}</p>
          <p class="text-xs mb-1">${dateStr}</p>
          <img src="./images/${imageFile}" class="w-10 h-10 mx-auto" alt="${desc}">
          <p>Temp: ${temp}°C</p>
          <p>Wind: ${wind} m/s</p>
          <p>Humidity: ${humidity}%</p>
        `;

        forecastContainer.appendChild(card);
      });

      showForecastSection();
    })
    .catch(error => {
      hideForecastSection();
      showError("Failed to load current location weather.");
      console.error("Location forecast fetch error:", error);
    });
}

//  Save and update recent city list
function updateRecentCities(city) {
  let recent = JSON.parse(localStorage.getItem("recentCities")) || [];
  recent = recent.filter(c => c.toLowerCase() !== city.toLowerCase()); 
  recent.unshift(city);            
  recent = recent.slice(0, 5);     
  localStorage.setItem("recentCities", JSON.stringify(recent));
  renderRecentCities();
}

// Show recent cities in <datalist>
function renderRecentCities() {
  const recent = JSON.parse(localStorage.getItem("recentCities")) || [];
  recentCitiesDatalist.innerHTML = "";
  recent.forEach(city => {
    const option = document.createElement("option");
    option.value = city;
    recentCitiesDatalist.appendChild(option);
  });
}

// Initialize recent city dropdown on page load
renderRecentCities();
