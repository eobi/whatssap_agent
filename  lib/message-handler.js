const utils = require('./utils');
const flightService = require('./flight-service');

/**
 * Process regular messages
 * @param {Object} client - WhatsApp client
 * @param {Object} message - Message object
 */
async function handleMessage(client, message) {
  try {
    // Skip processing for status messages
    const chat = await message.getChat();
    
    // In groups, only process messages where the bot is mentioned
    if (chat.isGroup && !message.mentionedIds.includes(client.info.wid._serialized)) {
      return;
    }
    
    const messageText = message.body;
    
    // Check if message is flight-related
    if (utils.isFlightRelated(messageText)) {
      console.log('Flight-related message detected:', messageText);
      
      // Extract user information
      const userInfo = await utils.extractContactInfo(message);
      console.log('User info:', userInfo);
      
      // Let the user know we're processing their request
      await client.sendMessage(message.from, 
        `Hi ${userInfo.userName}, I'm looking up flight information for you. One moment please...`);
      
      // Extract potential flight details from message
      const flightDetails = utils.extractFlightDetails(messageText);
      
      // Get flight information from API
      const query = flightDetails 
        ? `Flights from ${flightDetails.from} to ${flightDetails.to}`
        : messageText;
        
      const flightData = await flightService.getFlightInfo(query, userInfo);
      
      // Format and send response
      const response = utils.formatFlightResponse(flightData, userInfo);
      await client.sendMessage(message.from, response);
      
      // Log the interaction
      console.log(`Responded to ${userInfo.userName} (${userInfo.userNumber}) with flight information`);
    }
  } catch (error) {
    console.error('Error processing message:', error);
  }
}

/**
 * Process edited messages
 * @param {Object} client - WhatsApp client
 * @param {Object} message - Message object
 * @param {string} newBody - New message content
 * @param {string} prevBody - Previous message content
 */
async function handleEditedMessage(client, message, newBody, prevBody) {
  try {
    // Check if edited message is now flight-related
    if (utils.isFlightRelated(newBody)) {
      const userInfo = await utils.extractContactInfo(message);
      
      // Skip in groups unless mentioned
      const chat = await message.getChat();
      if (chat.isGroup && !message.mentionedIds.includes(client.info.wid._serialized)) {
        return;
      }
      
      console.log(`Message edited by ${userInfo.userName} from "${prevBody}" to "${newBody}"`);
      
      await client.sendMessage(message.from, 
        `I noticed you edited your message about flights. Let me search again...`);
      
      // Extract potential flight details from edited message
      const flightDetails = utils.extractFlightDetails(newBody);
      
      // Get flight information from API
      const query = flightDetails 
        ? `Flights from ${flightDetails.from} to ${flightDetails.to}`
        : newBody;
        
      const flightData = await flightService.getFlightInfo(query, userInfo);
      
      // Format and send response
      const response = utils.formatFlightResponse(flightData, userInfo);
      await client.sendMessage(message.from, response);
    }
  } catch (error) {
    console.error('Error processing edited message:', error);
  }
}

module.exports = {
  handleMessage,
  handleEditedMessage
};