import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;
const HOSTS = [`http://localhost:${PORT}`, `http://127.0.0.1:${PORT}`];

const pickHost = () => HOSTS[0];

const loginAndAdd = async () => {
  try {
    console.log('Logging in...');
    const API = pickHost();
    console.log('Using API host:', API);
    const loginRes = await axios.post(`${API}/api/auth/login`, {
      phone: '+919876543210',
      password: 'farmer123',
    });

    console.log('Login response:', loginRes.data.message || loginRes.data);
    const token = loginRes.data.token;
    if (!token) {
      console.error('No token returned from login');
      return;
    }

    console.log('Calling add-weather for Sanpada...');
    const addRes = await axios.post(
      `${API}/api/weather/get-weather`,
      { location: 'Sanpada' },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log('Add weather response:', addRes.data);
  } catch (err) {
    try {
      console.error('Error message:', err.message || err.toString());
      if (err.response) {
        console.error('Error response status:', err.response.status);
        console.error('Error response data:', JSON.stringify(err.response.data));
      }
      console.error('Stack:', err.stack);
    } catch (e) {
      console.error('Error printing error details:', e);
    }
  }
};

loginAndAdd();
