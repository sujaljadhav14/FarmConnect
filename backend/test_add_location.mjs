import axios from "axios";

const BASE = "http://localhost:5000";

const loginAndAdd = async () => {
  try {
    console.log("Logging in as test farmer...");
    const loginRes = await axios.post(`${BASE}/api/auth/login`, {
      phone: "+919876543210",
      password: "farmer123",
    });

    const token = loginRes.data?.token;
    if (!token) {
      console.error("Login did not return token:", loginRes.data);
      return;
    }

    console.log("Login successful — token received. Calling add-location API...");

    const addRes = await axios.post(
      `${BASE}/api/weather/get-weather`,
      { location: "Sanpada" },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log("Add-location response status:", addRes.status);
    console.log("Response data:", JSON.stringify(addRes.data, null, 2));
  } catch (err) {
    if (err.response) {
      console.error("API responded with status", err.response.status);
      console.error("Response data:", JSON.stringify(err.response.data, null, 2));
    } else {
      console.error("Request error:", err.message);
    }
  }
};

loginAndAdd();
