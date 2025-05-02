const fs = require('fs');
const path = require('path');
require('dotenv').config();
const whatsappClient = require('./lib/whatsapp-client');
const { initNotificationApi } = require('./lib/notification-api');
const authService = require('./lib/auth-service');

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize the WhatsApp client
whatsappClient.init()
  .then(() => {
    console.log('WhatsApp client initialized successfully');
    
    // Initialize auth service with default credentials
    return authService.authenticate(process.env.DEFAULT_PHONE || '+23480123456789');
  })
  .then(() => {
    console.log('Authentication service initialized successfully');
    
    // Start notification API if enabled
    if (process.env.ENABLE_NOTIFICATION_API === 'true') {
      const port = parseInt(process.env.NOTIFICATION_API_PORT || '3000', 10);
      initNotificationApi(port);
      console.log(`Notification API started on port ${port}`);
    }
  })
  .catch(error => {
    console.error('Initialization error:', error);
    process.exit(1);
  });

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down...');
  await whatsappClient.destroy();
  process.exit(0);
});

// Log startup
console.log('WhatsApp Flight Bot starting...');