// server/twilio.ts

import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

// Load environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

// Validate env variables
if (!accountSid || !authToken || !verifyServiceSid) {
  throw new Error("❌ Missing one or more Twilio environment variables.");
}

// Initialize Twilio client
const client = twilio(accountSid, authToken);

// Function to send OTP
export const sendOTP = async (phoneNumber: string) => {
  console.log(`📨 Sending OTP to: ${phoneNumber}`);

  try {
    const verification = await client.verify
      .v2.services(verifyServiceSid)
      .verifications.create({
        to: phoneNumber,
        channel: 'sms',
      });

    console.log("✅ OTP sent successfully:", {
      sid: verification.sid,
      status: verification.status,
      to: verification.to,
      channel: verification.channel,
    });

    return verification;
  } catch (error: any) {
    console.error("❌ Error while sending OTP:", {
      message: error.message,
      code: error.code,
      moreInfo: error.moreInfo,
    });
    throw new Error("Failed to send OTP");
  }
};

// Function to verify OTP
export const verifyOTP = async (phoneNumber: string, code: string) => {
  console.log(`🔍 Verifying OTP for: ${phoneNumber}, Code: ${code}`);

  try {
    const result = await client.verify
      .v2.services(verifyServiceSid)
      .verificationChecks.create({
        to: phoneNumber,
        code,
      });

    console.log("✅ OTP verification result:", {
      sid: result.sid,
      status: result.status,
      valid: result.valid,
    });

    return result;
  } catch (error: any) {
    console.error("❌ Error during OTP verification:", {
      message: error.message,
      code: error.code,
      moreInfo: error.moreInfo,
    });
    throw new Error("Failed to verify OTP");
  }
};
