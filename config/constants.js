// Flight-related keywords to listen for
const FLIGHT_KEYWORDS = [
    'flight', 'fly', 'plane', 'airport', 'airline', 'ticket', 'booking',
    'departure', 'arrival', 'travel', 'trip', 'journey', 'vacation',
    'check-in', 'boarding', 'layover', 'transit', 'connection'
  ];
  
  // WhatsApp client configuration
  const CLIENT_CONFIG = {
    puppeteer: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
  };
  
  // Mock flight API endpoint
  const FLIGHT_API_ENDPOINT = 'https://your-flight-api.com/search';
  
  module.exports = {
    FLIGHT_KEYWORDS,
    CLIENT_CONFIG,
    FLIGHT_API_ENDPOINT
  };