const whatsappClient = require('./lib/whatsapp-client');

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