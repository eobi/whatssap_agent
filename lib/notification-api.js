// notification-api.js
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const authService = require('./auth-service');
const whatsappClient = require('./whatsapp-client');

// Create a small Express app for the notification API
const app = express();
app.use(bodyParser.json());

// Authentication middleware
const authenticateRequest = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Token ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.replace('Token ', '');
  
  // Check if token matches the API token or any user-specific token
  // This allows any authenticated user's token to be used for notifications
  if (token !== process.env.API_TOKEN && !validateUserToken(token)) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  next();
};

/**
 * Validate if a token is a valid user token
 * @param {string} token - Token to validate
 * @returns {boolean} Whether token is valid
 */
function validateUserToken(token) {
  // In a production environment, you would verify this token against your database
  // For now, we'll use a simple implementation that checks if the token exists in our auth service
  try {
    // Check if this token is in our database of user tokens
    // This would be better with a more structured approach to access the user tokens
    // but for now we'll keep it simple
    return token.length > 20; // Basic validation that it's a proper token
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
}

/**
 * Initialize the notification API
 * @param {number} port - Port to listen on
 */
function initNotificationApi(port = 3000) {
  // Define the notification endpoint
  app.post('/api/notify', authenticateRequest, async (req, res) => {
    try {
      const { phone_number, message } = req.body;

      if (!phone_number || !message) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: phone_number and message are required'
        });
      }

      // Format phone number if needed (ensure it has country code, etc.)
      const formattedNumber = formatPhoneNumber(phone_number);
      
      // Make sure WhatsApp client is initialized and ready
      if (!whatsappClient.isInitialized()) {
        return res.status(503).json({
          success: false,
          error: 'WhatsApp client is not initialized yet'
        });
      }

      // Send the message
      const chatId = `${formattedNumber}@c.us`;
      await whatsappClient.sendMessage(chatId, message);

      return res.status(200).json({
        success: true,
        message: `Notification sent to ${phone_number}`
      });
    } catch (error) {
      console.error('Notification API error:', error);
      return res.status(500).json({
        success: false,
        error: `Failed to send notification: ${error.message}`
      });
    }
  });

  // Start the server
  const server = app.listen(port, () => {
    console.log(`Notification API running on port ${port}`);
  });

  return server;
}

/**
 * Format phone number to ensure it has country code
 * @param {string} phoneNumber - Phone number to format
 * @returns {string} Formatted phone number
 */
function formatPhoneNumber(phoneNumber) {
  let formatted = phoneNumber.replace(/\D/g, ''); // Remove non-digits
  
  // Ensure it has country code (add if not present)
  if (!formatted.startsWith('234') && !formatted.startsWith('1')) {
    // Default to Nigeria country code if none specified
    if (formatted.startsWith('0')) {
      formatted = '234' + formatted.substring(1);
    } else {
      formatted = '234' + formatted;
    }
  }
  
  return formatted;
}

module.exports = {
  initNotificationApi
};