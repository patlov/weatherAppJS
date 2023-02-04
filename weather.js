import { API_KEY } from "./utils.js";

// Get elements
const cityInput = document.getElementById("city-input");
const searchButton = document.getElementById("search-button");

// to be able to change the icon
const weatherIcon = document.getElementById("weatherImg");

// get city
const cityDisplay = document.getElementById('city');
const weatherTypeDisplay = document.getElementById('weathertype');
const feelsLikeDisplay = document.getElementById('feelsLike');
const temperatureDisplay = document.getElementById("temperature");

// humidity and windspeed and date
const humidityDisplay = document.getElementById("humidity");
const windSpeedDisplay = document.getElementById("windspeed");
const dateDisplay = document.getElementById("date");

// get chart and tabs
const chartContainer = document.querySelector("#chart");
const tabs = document.querySelectorAll(".tab");

const temperatureData = [];
const chartLabels = [];
const labels = [];


function addListeners() {
  searchButton.addEventListener("click", () => {
    const city = cityInput.value;
    getWeatherData(city);
  });
  
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => {
      tabs.forEach(tab => {
        tab.classList.remove("active");
      });
      tab.classList.add("active");
      updateChart(index);
    });
  });
}



async function fetchData(city) {
  const [currentWeatherResponse, forecastResponse] = await Promise.all([
    fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
    ),
    fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`
    )
  ]);

  const currentWeatherData = await currentWeatherResponse.json();
  const forecastData = await forecastResponse.json();

  return [currentWeatherData, forecastData]
}


function drawChart() {
  const chart = new Chart(chartContainer, {
    type: "line",
    data: {
      labels: chartLabels[0],
      datasets: [
        {
          label: "Temperature",
          data: temperatureData[0],
          backgroundColor: "rgba(183, 216, 248, 1)",
          borderColor: "rgba(24, 90, 157, 1)",
          borderWidth: 1,
          pointRadius: 5,
          pointHoverRadius: 10,
          fill: true
        }
      ]
    },
    options: {
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: true
            }
          }
        ]
      }
    }
  });

  window.chart = chart;

}

function updateText(city, currentWeatherData) {
  cityDisplay.textContent = city;
  temperatureDisplay.textContent = `${currentWeatherData.main.temp}°C`;
  weatherTypeDisplay.textContent = `${currentWeatherData.weather[0].main}`;
  feelsLikeDisplay.textContent = `Feels like ${currentWeatherData.main.feels_like}°C`;
  humidityDisplay.textContent = `${currentWeatherData.main.humidity}%`;
  windSpeedDisplay.textContent = `${currentWeatherData.wind.speed} km/h`;
  const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
  const date = new Date().toLocaleDateString('en-us',{ weekday: 'short', day:'numeric', month:'short', });
  dateDisplay.textContent = date + ' ' + time; 

  weatherIcon.src = `http://openweathermap.org/img/wn/${currentWeatherData.weather[0].icon}@2x.png`;
}

function updateChart(index) {
  chart.data.datasets[0].data = temperatureData[index];
  chart.data.labels = chartLabels[index];
  chart.update();
}

async function getWeatherData(city) {

  // important to reset the arrays for every city
  temperatureData.length = 0;
  labels.length = 0;
  chartLabels.length = 0;

  const [currentWeatherData, forecastData] = await fetchData(city)

  forecastData.list.forEach((item, i) => {
    let date = new Date(item.dt * 1000);
    let dateString = date.toLocaleDateString();
    if (i === 0 || dateString !== new Date(forecastData.list[i-1].dt * 1000).toLocaleDateString()) {
      temperatureData.push([item.main.temp]);
      labels.push(date.toLocaleDateString("en-US", {
        month: 'short',
        day: 'numeric'
      }));
      chartLabels.push([date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })])
    } else {
      temperatureData[temperatureData.length - 1].push(item.main.temp);
      chartLabels[chartLabels.length - 1].push(date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false }))
    }
  });


  updateText(city, currentWeatherData)
  drawChart();

  tabs[0].classList.add("active")
  tabs.forEach((tab, index) => {
    tab.textContent = labels[index];
  });
}


addListeners();
getWeatherData("London");

