// Weather update scheduler for batch processing
// Can be used with node-cron or directly in server startup

import Weather from "../models/Weather.js";
import axios from "axios";

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || "";
const OPENWEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5";

// Update all weather data for all users (run on schedule)
export const updateAllWeatherData = async (io) => {
  try {
    console.log("Starting batch weather update...");

    if (!OPENWEATHER_API_KEY) {
      console.warn("OpenWeather API key not configured");
      return;
    }

    // Get all weather locations that haven't been updated in the last 30 minutes
    const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);
    const weatherLocations = await Weather.find({
      lastUpdated: { $lt: thirtyMinsAgo },
    });

    console.log(`Found ${weatherLocations.length} locations to update`);

    // Update each location
    for (const weather of weatherLocations) {
      try {
        await updateWeatherLocation(weather, io);
      } catch (error) {
        console.error(`Error updating weather for ${weather.location}:`, error);
      }
    }

    console.log("Batch weather update completed");
  } catch (error) {
    console.error("Batch weather update error:", error);
  }
};

// Update single weather location
const updateWeatherLocation = async (weather, io) => {
  try {
    if (!OPENWEATHER_API_KEY) return;

    const weatherResponse = await axios.get(
      `${OPENWEATHER_BASE_URL}/weather?lat=${weather.latitude}&lon=${weather.longitude}&appid=${OPENWEATHER_API_KEY}&units=metric`
    );

    const forecastResponse = await axios.get(
      `${OPENWEATHER_BASE_URL}/forecast?lat=${weather.latitude}&lon=${weather.longitude}&appid=${OPENWEATHER_API_KEY}&units=metric`
    );

    // Process forecast data
    const forecastData = forecastResponse.data.list;
    const dailyForecasts = {};

    forecastData.forEach((item) => {
      const date = new Date(item.dt * 1000).toLocaleDateString();
      if (!dailyForecasts[date]) {
        dailyForecasts[date] = {
          date,
          day: new Date(item.dt * 1000).toLocaleDateString("en-US", {
            weekday: "short",
          }),
          temps: [],
          humidity: [],
          wind: [],
          description: item.weather[0].main,
          icon: item.weather[0].icon,
          precipitation: item.rain?.["3h"] || 0,
          chanceOfRain: item.pop ? (item.pop * 100).toFixed(0) : 0,
        };
      }
      dailyForecasts[date].temps.push(item.main.temp);
      dailyForecasts[date].humidity.push(item.main.humidity);
      dailyForecasts[date].wind.push(item.wind.speed);
    });

    const forecast = Object.values(dailyForecasts)
      .slice(0, 7)
      .map((item) => ({
        date: item.date,
        day: item.day,
        minTemp: Math.min(...item.temps).toFixed(1),
        maxTemp: Math.max(...item.temps).toFixed(1),
        avgTemp: (item.temps.reduce((a, b) => a + b) / item.temps.length).toFixed(1),
        humidity: (item.humidity.reduce((a, b) => a + b) / item.humidity.length).toFixed(0),
        windSpeed: (item.wind.reduce((a, b) => a + b) / item.wind.length).toFixed(1),
        description: item.description,
        icon: item.icon,
        precipitation: item.precipitation.toFixed(1),
        chanceOfRain: item.chanceOfRain,
      }));

    // Process hourly forecast
    const hourlyForecast = forecastData.slice(0, 8).map((item) => ({
      time: new Date(item.dt * 1000).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      temperature: item.main.temp.toFixed(1),
      description: item.weather[0].main,
      icon: item.weather[0].icon,
      windSpeed: item.wind.speed.toFixed(1),
      humidity: item.main.humidity,
      chanceOfRain: item.pop ? (item.pop * 100).toFixed(0) : 0,
    }));

    // Generate alerts
    const alerts = generateAlerts(weatherResponse.data);

    // Update weather document
    weather.currentWeather = {
      temperature: weatherResponse.data.main.temp.toFixed(1),
      feelsLike: weatherResponse.data.main.feels_like.toFixed(1),
      humidity: weatherResponse.data.main.humidity,
      windSpeed: weatherResponse.data.wind.speed.toFixed(1),
      windDirection: weatherResponse.data.wind.deg || 0,
      description: weatherResponse.data.weather[0].description,
      main: weatherResponse.data.weather[0].main,
      icon: weatherResponse.data.weather[0].icon,
      pressure: weatherResponse.data.main.pressure,
      visibility: (weatherResponse.data.visibility / 1000).toFixed(1),
      cloudCover: weatherResponse.data.clouds.all,
    };

    weather.forecast = forecast;
    weather.hourlyForecast = hourlyForecast;
    weather.alerts = alerts;
    weather.lastUpdated = new Date();

    await weather.save();

    // Emit socket.io update to user
    if (io) {
      io.to(`weather-${weather.userId}`).emit("weather-updated", {
        weather,
        timestamp: new Date(),
      });

      // Emit alerts if any
      if (alerts.length > 0) {
        io.to(`weather-alerts-${weather.userId}`).emit("weather-alert", {
          alerts,
          location: weather.location,
          timestamp: new Date(),
        });
      }
    }

    console.log(`Updated weather for ${weather.location}`);
  } catch (error) {
    console.error(`Weather update error for location:`, error);
  }
};

// Generate weather alerts
const generateAlerts = (weatherData) => {
  const alerts = [];

  if (weatherData.main?.temp > 40) {
    alerts.push({
      type: "EXTREME_HEAT",
      description: `High temperature alert: ${weatherData.main.temp}°C`,
      severity: "high",
    });
  }

  if (weatherData.main?.temp < 0) {
    alerts.push({
      type: "FROST",
      description: `Frost alert: Temperature ${weatherData.main.temp}°C`,
      severity: "high",
    });
  }

  if (weatherData.wind?.speed > 30) {
    alerts.push({
      type: "STRONG_WIND",
      description: `Strong wind warning: ${weatherData.wind.speed} m/s`,
      severity: "medium",
    });
  }

  if (weatherData.clouds?.all > 80) {
    alerts.push({
      type: "HEAVY_CLOUDS",
      description: "Heavy cloud coverage expected",
      severity: "low",
    });
  }

  if (weatherData.rain) {
    alerts.push({
      type: "RAIN",
      description: `Rain expected: ${weatherData.rain["1h"] || "Light"}`,
      severity: "low",
    });
  }

  return alerts;
};

// Schedule weather updates every 30 minutes
export const scheduleWeatherUpdates = (io) => {
  setInterval(async () => {
    await updateAllWeatherData(io);
  }, 30 * 60 * 1000); // 30 minutes

  console.log("Weather update scheduler started (every 30 minutes)");
};

// Manual trigger for testing
export const manualWeatherUpdate = async (io) => {
  console.log("Manual weather update triggered");
  await updateAllWeatherData(io);
};
