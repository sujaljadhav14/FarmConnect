import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

const useWeatherSocket = (userId, onWeatherUpdate, onWeatherAlert) => {
  const socket = useRef(null);

  useEffect(() => {
    if (!userId) return;

    // Connect to socket
    socket.current = io(process.env.REACT_APP_API);

    // Join weather room
    socket.current.emit("subscribe-weather-alerts", userId);

    // Listen for weather updates
    socket.current.on("weather-updated", (data) => {
      if (onWeatherUpdate) {
        onWeatherUpdate(data.weather);
      }
    });

    // Listen for weather alerts
    socket.current.on("weather-alert", (data) => {
      if (onWeatherAlert) {
        onWeatherAlert(data.alert);
      }
    });

    // Listen for broadcast weather alerts
    socket.current.on("weather-alert-broadcast", (data) => {
      if (onWeatherAlert) {
        onWeatherAlert(data.alert);
      }
    });

    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, [userId, onWeatherUpdate, onWeatherAlert]);

  return socket.current;
};

export default useWeatherSocket;
