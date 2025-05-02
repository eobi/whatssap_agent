const fs = require('fs');
const path = require('path');
const whatsappClient = require('./lib/whatsapp-client');

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize the WhatsApp client
whatsappClient.init()
  .catch(error => {
    console.error('Failed to initialize WhatsApp client:', error);
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