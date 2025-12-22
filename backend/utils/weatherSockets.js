// Socket.io event handlers for real-time weather updates
// This will be integrated into the server.js

export const setupWeatherSockets = (io) => {
  io.on("connection", (socket) => {
    console.log("Weather user connected:", socket.id);

    // Join weather room
    socket.on("join-weather-room", (userId) => {
      socket.join(`weather-${userId}`);
      console.log(`User ${userId} joined weather room`);
    });

    // Emit weather update to specific user
    socket.on("subscribe-weather", (data) => {
      const { userId, location } = data;
      socket.join(`weather-${userId}`);
      console.log(`User subscribed to weather for ${location}`);
    });

    // Handle weather alert subscription
    socket.on("subscribe-weather-alerts", (userId) => {
      socket.join(`weather-alerts-${userId}`);
      console.log(`User subscribed to weather alerts: ${userId}`);
    });

    // Send weather update to user
    socket.on("update-weather", (data) => {
      const { userId, weather } = data;
      io.to(`weather-${userId}`).emit("weather-updated", {
        weather,
        timestamp: new Date(),
      });
    });

    // Send weather alert to user
    socket.on("send-alert", (data) => {
      const { userId, alert } = data;
      io.to(`weather-alerts-${userId}`).emit("weather-alert", {
        alert,
        timestamp: new Date(),
      });
    });

    // Broadcast weather alert to all users in location
    socket.on("broadcast-weather-alert", (data) => {
      const { location, alert } = data;
      io.emit("weather-alert-broadcast", {
        location,
        alert,
        timestamp: new Date(),
      });
    });

    socket.on("disconnect", () => {
      console.log("Weather user disconnected:", socket.id);
    });
  });
};

// Helper function to emit weather update to a user
export const emitWeatherUpdate = (io, userId, weather) => {
  io.to(`weather-${userId}`).emit("weather-updated", {
    weather,
    timestamp: new Date(),
  });
};

// Helper function to emit weather alert to a user
export const emitWeatherAlert = (io, userId, alert) => {
  io.to(`weather-alerts-${userId}`).emit("weather-alert", {
    alert,
    timestamp: new Date(),
  });
};

// Helper function to broadcast weather alert to all connected users
export const broadcastWeatherAlert = (io, location, alert) => {
  io.emit("weather-alert-broadcast", {
    location,
    alert,
    timestamp: new Date(),
  });
};
