#!/usr/bin/env node
// tools/send-notification.js

const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Get command line arguments
const args = process.argv.slice(2);
const phoneNumber = args[0];
const message = args.slice(1).join(' ');

// Validate input
if (!phoneNumber || !message) {
  console.error('Usage: node send-notification.js <phone_number> <message>');
  console.error('Example: node send-notification.js +2348012345678 "Your flight has been confirmed"');
  process.exit(1);
}

// Configuration
const API_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const API_TOKEN = process.env.API_TOKEN;

/**
 * Send a notification via the API
 */
async function sendNotification() {
  try {
    const url = `${API_URL}/api/notify`;
    
    const response = await axios.post(url, {
      phone_number: phoneNumber,
      message: message
    }, {
      headers: {
        'Authorization': `Token ${API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data.success) {
      console.log(`✅ Notification sent successfully to ${phoneNumber}`);
    } else {
      console.error(`❌ Failed to send notification: ${response.data.error}`);
    }
  } catch (error) {
    console.error('❌ Error sending notification:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Message: ${JSON.stringify(error.response.data)}`);
    } else {
      console.error(error.message);
    }
    process.exit(1);
  }
}

// Execute the notification
sendNotification();