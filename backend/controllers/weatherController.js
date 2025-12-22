import Weather from "../models/Weather.js";
import axios from "axios";

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || "";
const OPENWEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5";

// Helper function to check if weather data needs update (older than 30 mins)
const needsUpdate = (lastUpdated) => {
    if (!lastUpdated) return true;
    const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);
    return new Date(lastUpdated) < thirtyMinsAgo;
};

// Helper function to generate weather alerts
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

// Get weather by location
export const getWeatherByLocation = async (req, res) => {
    try {
        const { location, latitude, longitude } = req.body;
        const userId = req.user._id;

        if (!location && (!latitude || !longitude)) {
            return res.status(400).json({
                success: false,
                message: "Location name or coordinates required",
            });
        }

        if (!OPENWEATHER_API_KEY) {
            return res.status(500).json({
                success: false,
                message: "Weather API not configured",
            });
        }

        let weatherResponse;

        // Get coordinates if location name is provided
        if (location && (!latitude || !longitude)) {
            try {
                const geoResponse = await axios.get(
                    `${OPENWEATHER_BASE_URL}/weather?q=${location}&appid=${OPENWEATHER_API_KEY}&units=metric`
                );
                weatherResponse = geoResponse.data;
            } catch (error) {
                return res.status(404).json({
                    success: false,
                    message: "Location not found",
                });
            }
        } else if (latitude && longitude) {
            // Use coordinates directly
            const weatherRes = await axios.get(
                `${OPENWEATHER_BASE_URL}/weather?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}&units=metric`
            );
            weatherResponse = weatherRes.data;
        }

        // Get forecast data (5 day/3 hour forecast)
        const forecastResponse = await axios.get(
            `${OPENWEATHER_BASE_URL}/forecast?lat=${weatherResponse.coord.lat}&lon=${weatherResponse.coord.lon}&appid=${OPENWEATHER_API_KEY}&units=metric`
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
                avgTemp: (
                    item.temps.reduce((a, b) => a + b) / item.temps.length
                ).toFixed(1),
                humidity: (
                    item.humidity.reduce((a, b) => a + b) / item.humidity.length
                ).toFixed(0),
                windSpeed: (
                    item.wind.reduce((a, b) => a + b) / item.wind.length
                ).toFixed(1),
                description: item.description,
                icon: item.icon,
                precipitation: item.precipitation.toFixed(1),
                chanceOfRain: item.chanceOfRain,
            }));

        // Process hourly forecast (next 24 hours)
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
        const alerts = generateAlerts(weatherResponse);

        // Prepare weather data
        const weatherData = {
            userId,
            location: weatherResponse.name || location,
            latitude: weatherResponse.coord.lat,
            longitude: weatherResponse.coord.lon,
            currentWeather: {
                temperature: weatherResponse.main.temp.toFixed(1),
                feelsLike: weatherResponse.main.feels_like.toFixed(1),
                humidity: weatherResponse.main.humidity,
                windSpeed: weatherResponse.wind.speed.toFixed(1),
                windDirection: weatherResponse.wind.deg || 0,
                description: weatherResponse.weather[0].description,
                main: weatherResponse.weather[0].main,
                icon: weatherResponse.weather[0].icon,
                pressure: weatherResponse.main.pressure,
                visibility: (weatherResponse.visibility / 1000).toFixed(1),
                cloudCover: weatherResponse.clouds.all,
            },
            forecast,
            hourlyForecast,
            alerts,
            lastUpdated: new Date(),
        };

        // Save or update weather data
        let savedWeather = await Weather.findOneAndUpdate(
            { userId, location: weatherResponse.name || location },
            weatherData,
            { upsert: true, new: true }
        );

        res.status(200).json({
            success: true,
            message: "Weather data retrieved successfully",
            weather: savedWeather,
        });
    } catch (error) {
        console.error("Get Weather Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch weather data",
            error: error.message,
        });
    }
};

// Get all saved weather locations for user
export const getUserWeatherLocations = async (req, res) => {
    try {
        const userId = req.user._id;

        const weatherLocations = await Weather.find({ userId }).sort({
            lastUpdated: -1,
        });

        // Check if any need updating
        const updatePromises = weatherLocations.map(async (weather) => {
            if (needsUpdate(weather.lastUpdated)) {
                return updateWeatherData(weather);
            }
            return weather;
        });

        const updatedWeathers = await Promise.all(updatePromises);

        res.status(200).json({
            success: true,
            count: updatedWeathers.length,
            weather: updatedWeathers,
        });
    } catch (error) {
        console.error("Get User Weather Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch weather data",
            error: error.message,
        });
    }
};

// Helper function to update weather data
const updateWeatherData = async (weather) => {
    try {
        if (!OPENWEATHER_API_KEY) return weather;

        const weatherResponse = await axios.get(
            `${OPENWEATHER_BASE_URL}/weather?lat=${weather.latitude}&lon=${weather.longitude}&appid=${OPENWEATHER_API_KEY}&units=metric`
        );

        const alerts = generateAlerts(weatherResponse.data);

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

        weather.alerts = alerts;
        weather.lastUpdated = new Date();

        await weather.save();
        return weather;
    } catch (error) {
        console.error("Update Weather Error:", error);
        return weather;
    }
};

// Get single weather location
export const getWeatherLocation = async (req, res) => {
    try {
        const { weatherId } = req.params;
        const userId = req.user._id;

        const weather = await Weather.findOne({
            _id: weatherId,
            userId,
        });

        if (!weather) {
            return res.status(404).json({
                success: false,
                message: "Weather location not found",
            });
        }

        // Update if older than 30 mins
        if (needsUpdate(weather.lastUpdated)) {
            await updateWeatherData(weather);
        }

        res.status(200).json({
            success: true,
            weather,
        });
    } catch (error) {
        console.error("Get Weather Location Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch weather data",
            error: error.message,
        });
    }
};

// Delete weather location
export const deleteWeatherLocation = async (req, res) => {
    try {
        const { weatherId } = req.params;
        const userId = req.user._id;

        const result = await Weather.findOneAndDelete({
            _id: weatherId,
            userId,
        });

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Weather location not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Weather location deleted successfully",
        });
    } catch (error) {
        console.error("Delete Weather Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete weather location",
            error: error.message,
        });
    }
};

// Toggle favorite
export const toggleFavoriteWeather = async (req, res) => {
    try {
        const { weatherId } = req.params;
        const userId = req.user._id;

        const weather = await Weather.findOne({
            _id: weatherId,
            userId,
        });

        if (!weather) {
            return res.status(404).json({
                success: false,
                message: "Weather location not found",
            });
        }

        weather.isFavorite = !weather.isFavorite;
        await weather.save();

        res.status(200).json({
            success: true,
            message: weather.isFavorite ? "Added to favorites" : "Removed from favorites",
            weather,
        });
    } catch (error) {
        console.error("Toggle Favorite Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update favorite status",
            error: error.message,
        });
    }
};

// Get weather alerts
export const getWeatherAlerts = async (req, res) => {
    try {
        const userId = req.user._id;

        const weathersWithAlerts = await Weather.find({
            userId,
            alerts: { $exists: true, $ne: [] },
        }).sort({ lastUpdated: -1 });

        const allAlerts = [];
        weathersWithAlerts.forEach((weather) => {
            weather.alerts.forEach((alert) => {
                allAlerts.push({
                    ...alert,
                    location: weather.location,
                    weatherId: weather._id,
                });
            });
        });

        res.status(200).json({
            success: true,
            count: allAlerts.length,
            alerts: allAlerts.sort(
                (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
            ),
        });
    } catch (error) {
        console.error("Get Weather Alerts Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch weather alerts",
            error: error.message,
        });
    }
};
