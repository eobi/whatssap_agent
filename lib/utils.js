const { FLIGHT_KEYWORDS } = require('../config/constants');

/**
 * Extract user information from a message
 * @param {Object} message - WhatsApp message object
 * @returns {Promise<Object>} User information
 */
async function extractContactInfo(message) {
  try {
    // Get contact information
    const chat = await message.getChat();
    const contact = await message.getContact();
    
    let userName = contact.pushname || 'Unknown';
    let userNumber = contact.number;
    let isGroup = chat.isGroup;
    let groupName = isGroup ? chat.name : null;
    
    return {
      userName,
      userNumber,
      isGroup,
      groupName,
      chatId: chat.id._serialized
    };
  } catch (error) {
    console.error('Error extracting contact info:', error);
    return {
      userName: 'Unknown',
      userNumber: 'Unknown',
      isGroup: false,
      groupName: null,
      chatId: null
    };
  }
}

/**
 * Check if message contains flight-related keywords
 * @param {string} messageText - Message text to analyze
 * @returns {boolean} True if message is flight-related
 */
function isFlightRelated(messageText) {
  const lowerText = messageText.toLowerCase();
  return FLIGHT_KEYWORDS.some(keyword => lowerText.includes(keyword));
}

/**
 * Extract potential flight locations from message
 * @param {string} messageText - Message text to analyze
 * @returns {Object|null} Flight details object with from and to properties
 */
function extractFlightDetails(messageText) {
  // This is a simple implementation - in a real app, you'd use NLP
  const words = messageText.split(/\s+/);
  const cityPairs = [];
  
  for (let i = 0; i < words.length; i++) {
    if (words[i].toLowerCase() === 'from' && i + 1 < words.length) {
      let fromCity = words[i + 1].replace(/[,.;:!?]/g, '');
      
      // Look for "to" keyword followed by a city
      for (let j = i + 2; j < words.length; j++) {
        if (words[j].toLowerCase() === 'to' && j + 1 < words.length) {
          let toCity = words[j + 1].replace(/[,.;:!?]/g, '');
          cityPairs.push({
            from: fromCity,
            to: toCity
          });
          break;
        }
      }
    }
  }
  
  return cityPairs.length > 0 ? cityPairs[0] : null;
}

/**
 * Format flight results into a readable message
 * @param {Object} flightData - Flight data from API
 * @param {Object} userInfo - User information
 * @returns {string} Formatted response message
 */
function formatFlightResponse(flightData, userInfo) {
  if (!flightData.success) {
    return `Sorry ${userInfo.userName}, I couldn't find flight information at this time. Please try again later.`;
  }
  
  let response = `Hello ${userInfo.userName},\n\nHere are some flight options for your query:`;
  
  flightData.flights.forEach((flight, index) => {
    response += `\n\n*Flight ${index + 1}:*\n`;
    response += `🛫 *${flight.flightNumber}*: ${flight.departure} → ${flight.arrival}\n`;
    response += `⏰ Departure: ${flight.departureTime}, Arrival: ${flight.arrivalTime}\n`;
    response += `💰 Price: ${flight.price}`;
  });
  
  response += `\n\nThank you for using our flight search service! For booking, please reply with the flight number you're interested in.`;
  return response;
}

module.exports = {
  extractContactInfo,
  isFlightRelated,
  extractFlightDetails,
  formatFlightResponse
};