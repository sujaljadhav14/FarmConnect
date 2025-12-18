// utils/twilioClient.js
import dotenv from "dotenv";
dotenv.config();

import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

if (!accountSid || !authToken) {
  console.warn("⚠️ Twilio credentials are not set in .env");
}

const twilioClient = twilio(accountSid, authToken);

export default twilioClient;
