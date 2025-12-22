import mongoose from "mongoose";

const weatherSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.ObjectId,
            ref: "users",
            required: true,
        },
        location: {
            type: String,
            required: true,
        },
        latitude: {
            type: Number,
        },
        longitude: {
            type: Number,
        },
        currentWeather: {
            temperature: Number,
            feelsLike: Number,
            humidity: Number,
            windSpeed: Number,
            windDirection: Number,
            description: String,
            main: String,
            icon: String,
            pressure: Number,
            visibility: Number,
            uvIndex: Number,
            cloudCover: Number,
        },
        forecast: [
            {
                date: String,
                day: String,
                minTemp: Number,
                maxTemp: Number,
                avgTemp: Number,
                humidity: Number,
                windSpeed: Number,
                description: String,
                icon: String,
                precipitation: Number,
                chanceOfRain: Number,
            },
        ],
        hourlyForecast: [
            {
                time: String,
                temperature: Number,
                description: String,
                icon: String,
                windSpeed: Number,
                humidity: Number,
                chanceOfRain: Number,
            },
        ],
        lastUpdated: {
            type: Date,
            default: Date.now,
        },
        alerts: [
            {
                type: {
                    type: String,
                },
                description: String,
                severity: {
                    type: String,
                    enum: ["low", "medium", "high", "severe"],
                },
                timestamp: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        isFavorite: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

export default mongoose.model("weather", weatherSchema);
