import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Weather.css"; // Import CSS file
import cloudy from "./assets/cloudy.png"; // Import cloud image
import partlyCloudy from "./assets/partly-cloudy.png"; // Import partly cloudy image
import sunny from "./assets/sunny.png"; // Import sunny image

const Weather = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchWeatherData = async (latitude, longitude) => {
      setLoadingWeather(true);
      try {
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=afaf15faacbe62267c077d8eec203e5b&units=metric`
        );
        setWeatherData(response.data);
      } catch (error) {
        console.error("Error fetching current weather data:", error);
        setError("Error fetching weather data");
      }
      setLoadingWeather(false);
    };

    const fetchForecastData = async (latitude, longitude) => {
      try {
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=afaf15faacbe62267c077d8eec203e5b&units=metric`
        );
        const filteredForecast = response.data.list.filter((item) =>
          item.dt_txt.includes("12:00:00")
        );
        setForecastData(filteredForecast.slice(0, 7));
      } catch (error) {
        console.error("Error fetching forecast data:", error);
      }
    };

    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            fetchWeatherData(latitude, longitude);
            fetchForecastData(latitude, longitude);
          },
          (error) => {
            console.error("Error getting location:", error);
            setError("Error getting location");
          }
        );
      } else {
        console.error("Geolocation is not supported by this browser");
        setError("Geolocation is not supported by this browser");
      }
    };

    getLocation();
  }, []);

  const getDayName = (dateString) => {
    const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const date = new Date(dateString);
    return days[date.getDay()];
  };

  const getWeatherInfo = (weatherDescription) => {
    if (weatherDescription.includes("cloud")) {
      return { image: cloudy, description: "Partly Cloudy" };
    } else if (weatherDescription.includes("rain")) {
      return { image: partlyCloudy, description: "Rainy" };
    } else {
      return { image: sunny, description: "Clear" };
    }
  };

  return (
    <div className="weather-container roboto-regular ">
      {loadingWeather && <p>Loading...</p>}
      {error && <p className="error-message">{error}</p>}
      {weatherData && (
        <div className="current-weather">
          <div>
            <p>{weatherData.main.temp}°C</p>
            <p>
              {getWeatherInfo(weatherData.weather[0].description).description}
            </p>
          </div>
          <div>
           
            <img
              src={getWeatherInfo(weatherData.weather[0].description).image}
              alt="Weather"
              style={{ width: "90px", height: "90px" }}
            />
          </div>

          {/* <div>
            <p>Wind Speed: {weatherData.wind.speed} m/s</p>
            <p>
              Precipitation:{" "}
              {weatherData.weather[0].main === "Rain" ? "Rainy" : "None"}
            </p>
            <p>Pressure: {weatherData.main.pressure} hPa</p>
          </div> */}
        </div>
      )}

      {forecastData && (
        <div className="weekly">
          <h2>Weekly Forecast</h2>
        
        <div className="weekly-forecast">
          {forecastData.map((item, index) => (
            <div key={index} className="forecast-item">
              <p>{getDayName(item.dt_txt)}</p>
              <img
                src={getWeatherInfo(item.weather[0].description).image}
                alt="Weather"
              />
              <p>{item.main.temp}°C</p>
            </div>
          ))}
        </div>
        </div>
      )}
    </div>
  );
};

export default Weather;
